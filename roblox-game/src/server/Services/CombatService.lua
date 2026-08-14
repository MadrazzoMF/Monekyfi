--[[
	CombatService
	Todo o combate do jogo. O cliente só pede ("quero usar Z apontando para
	este ponto"); o servidor decide se pode, quanto dói e em quem acerta.

	Duas decisões de design importantes:

	1. Alvos são coletados da lista de jogadores + NPCs marcados, e filtrados
	   por distância. Isso é mais confiável que uma consulta espacial: nada é
	   perdido por limite de parts e a decoração do mapa nunca entra no cálculo.

	2. A mira do cliente nunca é usada crua — é sempre truncada para o alcance
	   do golpe a partir da posição real do jogador no servidor. Um cliente
	   modificado pode apontar para onde quiser e ainda assim não alcança nada
	   além do que o golpe permite.
]]

local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)
local FruitConfig = require(Shared.Config.FruitConfig)
local WeaponConfig = require(Shared.Config.WeaponConfig)
local ZoneConfig = require(Shared.Config.ZoneConfig)
local DamageMath = require(Shared.Util.DamageMath)
local Cooldowns = require(Shared.Util.Cooldowns)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)
local NpcService = require(script.Parent.NpcService)
local VfxService = require(script.Parent.VfxService)

local CombatService = {}

local cooldowns = Cooldowns.new()
local warnCooldowns = Cooldowns.new()
local projectileFolder = nil

local PROJECTILE_MAX_LIFETIME = 6

--[[
	Pasta dos projéteis. Eles são as únicas parts que o servidor ainda cria no
	combate — e mesmo elas nascem invisíveis: existem para o servidor mover e
	testar acerto, e o cliente as veste (ver VfxService.tagProjectile).

	Todo o resto do visual sai de VfxService.play, que só manda um pedido pela
	rede. Nenhuma part de efeito é criada nem replicada pelo servidor.
]]
local function getProjectileFolder()
	if projectileFolder and projectileFolder.Parent then
		return projectileFolder
	end

	local world = Workspace:FindFirstChild("World") or Workspace
	local folder = world:FindFirstChild("Projectiles")
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "Projectiles"
		folder.Parent = world
	end
	projectileFolder = folder
	return folder
end

-- Alvos ----------------------------------------------------------------------

local function notifyOnce(player, key, text)
	if not warnCooldowns:isReady(player, key) then
		return
	end
	warnCooldowns:start(player, key, 3)
	Net.event("Notify"):FireClient(player, text, "error")
end

local function describeTarget(model, player)
	local humanoid = model:FindFirstChildOfClass("Humanoid")
	local root = model.PrimaryPart or model:FindFirstChild("HumanoidRootPart")
	if not humanoid or not root or humanoid.Health <= 0 then
		return nil
	end
	return { model = model, humanoid = humanoid, root = root, player = player }
end

local function candidateTargets(attacker)
	local targets = {}

	for _, player in ipairs(Players:GetPlayers()) do
		if player ~= attacker and player.Character then
			local target = describeTarget(player.Character, player)
			if target then
				table.insert(targets, target)
			end
		end
	end

	for _, model in ipairs(CollectionService:GetTagged(NpcService.EnemyTag)) do
		local target = describeTarget(model, nil)
		if target then
			table.insert(targets, target)
		end
	end

	return targets
end

-- nil = pode atacar. String = motivo do bloqueio.
local function pvpBlockReason(attacker, attackerData, attackerPosition, targetPlayer, targetRoot)
	local targetData = DataService.get(targetPlayer)
	if not targetData then
		return "Jogador ainda carregando."
	end

	if attackerData.level < GameConfig.PvpLevelRequirement then
		return string.format("PVP liberado a partir do nível %d.", GameConfig.PvpLevelRequirement)
	end

	if targetData.level < GameConfig.PvpLevelRequirement then
		return string.format("%s ainda está protegido (abaixo do nível %d).", targetPlayer.DisplayName, GameConfig.PvpLevelRequirement)
	end

	if ZoneConfig.isSafeAt(attackerPosition) or ZoneConfig.isSafeAt(targetRoot.Position) then
		return "Zona segura: sem PVP aqui."
	end

	return nil
end

function CombatService.applyDamage(attacker, target, rawAmount, elementId)
	local amount = rawAmount
	if target.player then
		amount *= GameConfig.PvpDamageMultiplier
	end
	amount = math.max(1, math.floor(amount))

	target.humanoid:TakeDamage(amount)

	if not target.player then
		NpcService.registerDamage(target.model, attacker, amount)
	end

	local position = target.root.Position + Vector3.new(0, 2.5, 0)
	Net.event("Damage"):FireClient(attacker, position, amount, false)

	if target.player then
		Net.event("Damage"):FireClient(target.player, position, amount, true)
	end

	-- O corpo atingido pisca. É o feedback mais importante do combate: sem ele
	-- o jogador não sabe se o golpe pegou.
	VfxService.play({
		id = "hitFlash",
		position = target.root.Position,
		element = elementId,
		target = target.model,
	})
end

--[[
	Aplica dano a todos os alvos válidos dentro do volume descrito.

	shape = {
		center     Vector3
		radius     number
		origin     Vector3?  -- necessário para cone
		direction  Vector3?  -- necessário para cone
		angle      number?   -- graus; presente => cone
		element    string?   -- elemento usado no flash de acerto
	}
]]
local function damageInShape(attacker, attackerData, attackerPosition, shape, damage)
	local hits = 0
	local blockedReason = nil

	local cosLimit = shape.angle and math.cos(math.rad(shape.angle)) or nil

	for _, target in ipairs(candidateTargets(attacker)) do
		local toTarget = target.root.Position - shape.center
		-- +2 studs de folga: o root fica no meio do corpo, e sem a folga
		-- golpes que visualmente acertam passariam batido.
		local withinRange = toTarget.Magnitude <= shape.radius + 2

		if withinRange and cosLimit then
			local fromOrigin = target.root.Position - shape.origin
			local flat = Vector3.new(fromOrigin.X, 0, fromOrigin.Z)
			if flat.Magnitude < 0.1 then
				withinRange = true
			else
				withinRange = flat.Unit:Dot(shape.direction) >= cosLimit
			end
		end

		if withinRange then
			if target.player then
				local reason = pvpBlockReason(attacker, attackerData, attackerPosition, target.player, target.root)
				if reason then
					blockedReason = reason
				else
					CombatService.applyDamage(attacker, target, damage, shape.element)
					hits += 1
				end
			else
				CombatService.applyDamage(attacker, target, damage, shape.element)
				hits += 1
			end
		end
	end

	if hits == 0 and blockedReason then
		notifyOnce(attacker, "pvp", blockedReason)
	end

	return hits
end

-- Utilidades de mira ---------------------------------------------------------

local function isFiniteVector(value)
	if typeof(value) ~= "Vector3" then
		return false
	end
	-- NaN nunca é igual a si mesmo; um cliente modificado pode enviar NaN para
	-- tentar quebrar a matemática do servidor.
	local magnitude = value.Magnitude
	return magnitude == magnitude and magnitude < math.huge
end

local function aliveState(player)
	local data = DataService.get(player)
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	local root = character and character:FindFirstChild("HumanoidRootPart")

	if not data or not humanoid or not root or humanoid.Health <= 0 then
		return nil
	end

	return data, character, root
end

-- Direção horizontal do jogador até a mira, com fallback para o "olhar".
local function aimDirection(root, aimPosition)
	local offset = aimPosition - root.Position
	local flat = Vector3.new(offset.X, 0, offset.Z)
	if flat.Magnitude < 0.1 then
		local look = root.CFrame.LookVector
		flat = Vector3.new(look.X, 0, look.Z)
	end
	if flat.Magnitude < 0.1 then
		return Vector3.new(0, 0, -1)
	end
	return flat.Unit
end

local function clampAim(root, aimPosition, maxRange)
	local limit = math.min(maxRange, GameConfig.MaxAimDistance)
	local offset = aimPosition - root.Position
	if offset.Magnitude < 0.1 then
		return root.Position + aimDirection(root, aimPosition) * limit
	end
	return root.Position + offset.Unit * math.min(offset.Magnitude, limit)
end

-- Projéteis ------------------------------------------------------------------

local function launchProjectile(attacker, attackerData, origin, direction, move, damage, fruit)
	local part = Instance.new("Part")
	part.Shape = Enum.PartType.Ball
	part.Anchored = true
	part.CanCollide = false
	part.CanQuery = false
	part.CanTouch = false
	part.Transparency = 1 -- o cliente é quem dá aparência a isto
	part.Size = Vector3.new(1, 1, 1) * math.max(1.5, move.radius * 0.7)
	part.CFrame = CFrame.new(origin)

	-- Tag e atributos ANTES do parent, para chegarem ao cliente junto com a part.
	VfxService.tagProjectile(part, fruit.element, fruit.color, move.radius)
	part.Parent = getProjectileFolder()

	local rayParams = RaycastParams.new()
	rayParams.FilterType = Enum.RaycastFilterType.Exclude
	rayParams.FilterDescendantsInstances = { getProjectileFolder(), attacker.Character }

	local traveled = 0
	local finished = false
	local connection = nil

	local function finish(position)
		if finished then
			return
		end
		finished = true

		if connection then
			connection:Disconnect()
		end
		part:Destroy()

		VfxService.play({
			id = "projectileImpact",
			position = position,
			element = fruit.element,
			color = fruit.color,
			radius = move.radius,
		})

		damageInShape(attacker, attackerData, origin, {
			center = position,
			radius = move.radius,
			element = fruit.element,
		}, damage)
	end

	connection = RunService.Heartbeat:Connect(function(deltaTime)
		if finished then
			return
		end

		-- Passo limitado ao raio: um projétil rápido não pode "pular" por cima
		-- de um alvo entre dois frames.
		local step = math.min(move.speed * deltaTime, math.max(2, move.radius))
		local currentPosition = part.Position
		local nextPosition = currentPosition + direction * step
		traveled += step

		local blocked = Workspace:Raycast(currentPosition, direction * step, rayParams)

		for _, target in ipairs(candidateTargets(attacker)) do
			if (target.root.Position - nextPosition).Magnitude <= move.radius + 2 then
				finish(nextPosition)
				return
			end
		end

		if blocked then
			finish(blocked.Position)
			return
		end

		if traveled >= move.range then
			finish(nextPosition)
			return
		end

		part.CFrame = CFrame.new(nextPosition)
	end)

	-- Rede de segurança: nenhum projétil sobrevive além disso, mesmo se algo
	-- der errado no loop.
	task.delay(PROJECTILE_MAX_LIFETIME, function()
		finish(part.Parent and part.Position or origin)
	end)
end

-- Handlers -------------------------------------------------------------------

local function onM1(player, aimPosition)
	if not isFiniteVector(aimPosition) then
		return
	end

	local data, character, root = aliveState(player)
	if not data then
		return
	end

	local weapon = WeaponConfig.get(data.equipped) or WeaponConfig.get(WeaponConfig.Default)
	if not cooldowns:isReady(player, "M1", GameConfig.CooldownTolerance) then
		return
	end
	cooldowns:start(player, "M1", weapon.cooldown)

	local damage = DamageMath.compute(weapon.baseDamage, data.stats[weapon.stat], data.level)
	local direction = aimDirection(root, aimPosition)

	if weapon.kind == "Hitscan" then
		local target = clampAim(root, aimPosition, weapon.range)
		local origin = root.Position + Vector3.new(0, 1, 0)
		local offset = target - origin

		local rayParams = RaycastParams.new()
		rayParams.FilterType = Enum.RaycastFilterType.Exclude
		rayParams.FilterDescendantsInstances = { getProjectileFolder(), character }

		local result = Workspace:Raycast(origin, offset, rayParams)
		local endPosition = result and result.Position or target

		local hitModel = nil
		if result then
			-- Um raio acerta um corpo só: resolve pelo modelo atingido.
			hitModel = result.Instance:FindFirstAncestorOfClass("Model")
			if hitModel then
				damageInShape(player, data, root.Position, {
					center = hitModel:GetPivot().Position,
					radius = 4,
					element = weapon.element,
				}, damage)
			end
		end

		VfxService.play({
			id = "gunshot",
			position = endPosition,
			origin = origin + direction * 2,
			element = weapon.element,
			color = weapon.color,
		})
	else
		local center = root.Position + direction * (weapon.range * 0.5)

		VfxService.play({
			id = weapon.stat == "Sword" and "swordSlash" or "meleeImpact",
			position = center,
			element = weapon.element,
			color = weapon.color,
			radius = weapon.hitRadius,
		})

		damageInShape(player, data, root.Position, {
			center = center,
			radius = weapon.hitRadius,
			element = weapon.element,
		}, damage)
	end

	Net.event("MoveResult"):FireClient(player, "M1", weapon.cooldown)
end

local function onUseMove(player, moveKey, aimPosition)
	if type(moveKey) ~= "string" or not isFiniteVector(aimPosition) then
		return
	end

	local data, _, root = aliveState(player)
	if not data then
		return
	end

	if not data.fruit then
		notifyOnce(player, "nofruit", "Você não tem uma fruta. Procure uma no mapa.")
		return
	end

	local fruit = FruitConfig.get(data.fruit)
	local move = FruitConfig.getMove(data.fruit, moveKey)
	if not fruit or not move then
		return
	end

	if not cooldowns:isReady(player, moveKey, GameConfig.CooldownTolerance) then
		return
	end
	cooldowns:start(player, moveKey, move.cooldown)

	local damage = DamageMath.compute(move.baseDamage, data.stats.Fruit, data.level)
	local direction = aimDirection(root, aimPosition)

	if move.kind == "Projectile" then
		local origin = root.Position + Vector3.new(0, 1.5, 0) + direction * 3
		launchProjectile(player, data, origin, direction, move, damage, fruit)
	elseif move.kind == "AreaAtTarget" then
		local center = clampAim(root, aimPosition, move.range)

		VfxService.play({
			id = "areaBlast",
			position = center,
			element = fruit.element,
			color = fruit.color,
			radius = move.radius,
		})

		damageInShape(player, data, root.Position, {
			center = center,
			radius = move.radius,
			element = fruit.element,
		}, damage)
	elseif move.kind == "ConeInFront" then
		local center = root.Position + direction * (move.range * 0.5)

		VfxService.play({
			id = "cone",
			position = center,
			origin = root.Position + Vector3.new(0, 1.5, 0) + direction * 2,
			direction = direction,
			length = move.range,
			width = move.range * math.tan(math.rad(move.angle)) * 0.9,
			element = fruit.element,
			color = fruit.color,
		})

		damageInShape(player, data, root.Position, {
			center = center,
			radius = move.range * 0.65,
			origin = root.Position,
			direction = direction,
			angle = move.angle,
			element = fruit.element,
		}, damage)
	elseif move.kind == "AroundSelf" then
		VfxService.play({
			id = "nova",
			position = root.Position,
			element = fruit.element,
			color = fruit.color,
			radius = move.radius,
		})

		damageInShape(player, data, root.Position, {
			center = root.Position,
			radius = move.radius,
			element = fruit.element,
		}, damage)
	end

	Net.event("MoveResult"):FireClient(player, moveKey, move.cooldown)
end

function CombatService.start()
	Net.event("M1").OnServerEvent:Connect(onM1)
	Net.event("UseMove").OnServerEvent:Connect(onUseMove)

	Players.PlayerRemoving:Connect(function(player)
		cooldowns:clear(player)
		warnCooldowns:clear(player)
	end)
end

return CombatService
