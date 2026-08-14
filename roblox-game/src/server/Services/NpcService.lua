--[[
	NpcService
	Cria, controla e respawna os inimigos farmáveis, e distribui as recompensas
	de abate.

	A IA roda num único loop no servidor em vez de um Script por NPC: com 40+
	inimigos, um loop só é muito mais barato e fácil de depurar.
]]

local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local PhysicsService = game:GetService("PhysicsService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local NpcConfig = require(Shared.Config.NpcConfig)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)
local LevelService = require(script.Parent.LevelService)
local QuestService = require(script.Parent.QuestService)
local VfxService = require(script.Parent.VfxService)
local RigBuilder = require(script.Parent.Parent.World.RigBuilder)

local NpcService = {}

NpcService.EnemyTag = "EnemyNpc"

local NPC_COLLISION_GROUP = "Npcs"
local AI_TICK = 0.15
local CORPSE_LIFETIME = 4

-- Fração mínima do dano total para receber recompensa e crédito de missão.
local MIN_REWARD_SHARE = 0.15
-- Quem não deu o maior dano recebe esta fração da recompensa.
local ASSIST_MULTIPLIER = 0.4

local records = {} -- [Model] = record
local npcFolder = nil

local function setupCollisionGroup()
	-- pcall: registrar duas vezes (ex.: reinício de servidor no Studio) lança erro.
	pcall(function()
		PhysicsService:RegisterCollisionGroup(NPC_COLLISION_GROUP)
	end)
	pcall(function()
		-- Sem isto, os inimigos se empurram e acabam caindo no mar.
		PhysicsService:CollisionGroupSetCollidable(NPC_COLLISION_GROUP, NPC_COLLISION_GROUP, false)
	end)
end

local function rewardKill(record)
	local def = record.def
	local log = record.damageLog

	local total = 0
	local topUserId, topDamage = nil, 0
	for userId, amount in pairs(log) do
		total += amount
		if amount > topDamage then
			topUserId, topDamage = userId, amount
		end
	end

	if total <= 0 then
		return
	end

	for userId, amount in pairs(log) do
		local share = amount / total
		if share >= MIN_REWARD_SHARE then
			local player = Players:GetPlayerByUserId(userId)
			if player and player.Parent then
				local multiplier = (userId == topUserId) and 1 or ASSIST_MULTIPLIER

				LevelService.addBeli(player, math.floor(def.beliReward * multiplier))
				LevelService.addXp(player, math.floor(def.xpReward * multiplier))
				QuestService.registerKill(player, def.id)

				local data = DataService.get(player)
				if data then
					data.kills += 1
				end
			end
		end
	end
end

local function onDeath(record)
	if record.dead then
		return
	end
	record.dead = true

	CollectionService:RemoveTag(record.model, NpcService.EnemyTag)
	rewardKill(record)
	records[record.model] = nil

	if record.root then
		VfxService.play({
			id = "death",
			position = record.root.Position,
			element = "Physical",
			color = record.def.shirtColor,
			radius = record.def.isBoss and 16 or 7,
		})
	end

	local model = record.model
	task.delay(CORPSE_LIFETIME, function()
		if model.Parent then
			model:Destroy()
		end
	end)

	task.delay(record.def.respawnTime, function()
		if record.marker.Parent then
			NpcService.spawnFromMarker(record.marker)
		end
	end)
end

function NpcService.spawnFromMarker(marker)
	local npcId = marker:GetAttribute("NpcId")
	local def = NpcConfig.get(npcId)
	if not def then
		return nil
	end

	local scale = def.scale or 1
	local model, humanoid = RigBuilder.build({
		name = def.name,
		bodyColor = def.bodyColor,
		shirtColor = def.shirtColor,
		scale = scale,
		maxHealth = def.maxHealth,
		walkSpeed = def.walkSpeed,
	})

	for _, descendant in ipairs(model:GetDescendants()) do
		if descendant:IsA("BasePart") then
			descendant.CollisionGroup = NPC_COLLISION_GROUP
		end
	end

	local groundPosition = Vector3.new(marker.Position.X, 0, marker.Position.Z)
	RigBuilder.placeOnGround(model, groundPosition, scale)
	RigBuilder.attachNameplate(
		model,
		humanoid,
		def.name,
		string.format("Nível %d", def.level),
		def.isBoss and Color3.fromRGB(255, 140, 140) or Color3.fromRGB(255, 255, 255)
	)

	model:SetAttribute("NpcId", def.id)
	model:SetAttribute("Level", def.level)
	CollectionService:AddTag(model, NpcService.EnemyTag)
	model.Parent = npcFolder

	local record = {
		model = model,
		humanoid = humanoid,
		root = model.PrimaryPart,
		def = def,
		marker = marker,
		spawnPosition = groundPosition,
		damageLog = {},
		lastAttack = 0,
		dead = false,
	}
	records[model] = record

	humanoid.Died:Connect(function()
		onDeath(record)
	end)

	return model
end

-- Chamado pelo CombatService a cada acerto, para saber quem merece a recompensa.
function NpcService.registerDamage(model, player, amount)
	local record = records[model]
	if not record or record.dead then
		return
	end
	record.damageLog[player.UserId] = (record.damageLog[player.UserId] or 0) + amount
end

function NpcService.isEnemy(model)
	return records[model] ~= nil
end

-- IA -------------------------------------------------------------------------

local function nearestTarget(record)
	local origin = record.root.Position
	local bestCharacter, bestDistance = nil, record.def.aggroRange

	for _, player in ipairs(Players:GetPlayers()) do
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		local root = character and character:FindFirstChild("HumanoidRootPart")

		if humanoid and root and humanoid.Health > 0 then
			local distance = (root.Position - origin).Magnitude
			if distance < bestDistance then
				bestCharacter, bestDistance = character, distance
			end
		end
	end

	return bestCharacter, bestDistance
end

local function attack(record, targetCharacter)
	local now = os.clock()
	if now - record.lastAttack < record.def.attackCooldown then
		return
	end
	record.lastAttack = now

	local humanoid = targetCharacter:FindFirstChildOfClass("Humanoid")
	if not humanoid or humanoid.Health <= 0 then
		return
	end

	humanoid:TakeDamage(record.def.damage)

	local player = Players:GetPlayerFromCharacter(targetCharacter)
	local root = targetCharacter:FindFirstChild("HumanoidRootPart")
	if player and root then
		Net.event("Damage"):FireClient(player, root.Position, record.def.damage, true)

		-- O tremor cai com a distância da câmera, então quem levou sente o
		-- golpe e quem está de fora quase não percebe.
		VfxService.play({
			id = "npcHit",
			position = root.Position,
			element = "Physical",
			radius = 5,
			target = targetCharacter,
		})
	end
end

local function tick()
	for model, record in pairs(records) do
		if record.dead or not model.Parent or not record.root or record.humanoid.Health <= 0 then
			continue
		end

		local position = record.root.Position

		-- Caiu do mapa ou afundou: devolve ao ponto de spawn em vez de deixar
		-- o inimigo perdido para sempre.
		if position.Y < -30 then
			RigBuilder.placeOnGround(model, record.spawnPosition, record.def.scale or 1)
			continue
		end

		local distanceFromSpawn = (position - record.spawnPosition).Magnitude
		if distanceFromSpawn > record.def.leashRange then
			record.humanoid:MoveTo(record.spawnPosition)
			continue
		end

		local target, distance = nearestTarget(record)
		if target then
			local targetRoot = target:FindFirstChild("HumanoidRootPart")
			if targetRoot then
				record.humanoid:MoveTo(targetRoot.Position)
				if distance <= record.def.attackRange then
					attack(record, target)
				end
			end
		elseif distanceFromSpawn > 6 then
			record.humanoid:MoveTo(record.spawnPosition)
		end
	end
end

function NpcService.start()
	setupCollisionGroup()

	local world = Workspace:WaitForChild("World", 30)
	assert(world, "NpcService: Workspace.World não existe. MapBuilder.build() rodou?")
	npcFolder = world:WaitForChild("Npcs")

	for _, marker in ipairs(CollectionService:GetTagged("NpcSpawn")) do
		NpcService.spawnFromMarker(marker)
	end

	local accumulator = 0
	RunService.Heartbeat:Connect(function(deltaTime)
		accumulator += deltaTime
		if accumulator < AI_TICK then
			return
		end
		accumulator = 0

		local ok, err = pcall(tick)
		if not ok then
			warn("[NpcService] erro no tick da IA: " .. tostring(err))
		end
	end)
end

return NpcService
