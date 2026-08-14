--[[
	CharacterService
	Dono do personagem do jogador: vida máxima derivada dos stats, respawn na
	última ilha visitada, placa de nome com nível e o modelo da arma equipada.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)
local WeaponConfig = require(Shared.Config.WeaponConfig)
local ZoneConfig = require(Shared.Config.ZoneConfig)
local DamageMath = require(Shared.Util.DamageMath)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)
local LevelService = require(script.Parent.LevelService)

local CharacterService = {}

-- Onde cada jogador morreu, para respawnar na mesma ilha em vez de voltar
-- sempre para a ilha inicial.
local lastZoneId = {}

-- Abaixo desta altura o jogador está em queda livre fora do mapa: o fundo do
-- mar fica em -30, então qualquer coisa abaixo disso é queda de verdade.
local FALL_RESCUE_Y = -60

local function humanoidOf(player)
	local character = player.Character
	if not character then
		return nil, nil
	end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid or humanoid.Health <= 0 then
		return nil, character
	end
	return humanoid, character
end

-- Recalcula a vida máxima preservando a fração de vida atual, para que ganhar
-- um nível no meio de uma luta não cure nem mate o jogador.
function CharacterService.applyStats(player)
	local data = DataService.get(player)
	if not data then
		return
	end

	local humanoid, character = humanoidOf(player)
	if not humanoid or not character then
		return
	end

	local newMax = DamageMath.maxHealth(data.level, data.stats.Defense)
	local ratio = 1
	if humanoid.MaxHealth > 0 then
		ratio = math.clamp(humanoid.Health / humanoid.MaxHealth, 0, 1)
	end

	humanoid.MaxHealth = newMax
	humanoid.Health = math.clamp(newMax * ratio, 1, newMax)
	humanoid.WalkSpeed = GameConfig.BaseWalkSpeed
end

-- Modelo simples da arma soldado na mão. Suporta R6 e R15 porque o avatar do
-- jogador pode ser qualquer um dos dois.
function CharacterService.refreshWeaponModel(player)
	local data = DataService.get(player)
	local character = player.Character
	if not data or not character then
		return
	end

	local existing = character:FindFirstChild("EquippedWeapon")
	if existing then
		existing:Destroy()
	end

	local weapon = WeaponConfig.get(data.equipped)
	if not weapon or weapon.id == WeaponConfig.Default then
		return -- punhos não têm modelo
	end

	local isR15 = character:FindFirstChild("RightHand") ~= nil
	local anchor = character:FindFirstChild("RightHand") or character:FindFirstChild("Right Arm")
	if not anchor then
		return
	end

	local model = Instance.new("Part")
	model.Name = "EquippedWeapon"
	model.Anchored = false
	model.CanCollide = false
	model.Massless = true
	model.Color = weapon.color
	model.Material = Enum.Material.Metal
	model.TopSurface = Enum.SurfaceType.Smooth
	model.BottomSurface = Enum.SurfaceType.Smooth

	local grip
	if weapon.id == "Flintlock" then
		model.Size = Vector3.new(0.4, 0.7, 1.6)
		grip = CFrame.new(0, isR15 and -0.6 or -1.2, -0.4)
	else
		model.Size = Vector3.new(0.25, 4.2, 0.5)
		grip = CFrame.new(0, isR15 and -2 or -2.6, -0.2)
	end

	model.CFrame = anchor.CFrame * grip
	model.Parent = character

	local weld = Instance.new("WeldConstraint")
	weld.Part0 = anchor
	weld.Part1 = model
	weld.Parent = model
end

local function attachNameplate(player, character)
	local head = character:FindFirstChild("Head")
	local data = DataService.get(player)
	if not head or not data then
		return
	end

	local billboard = Instance.new("BillboardGui")
	billboard.Name = "PlayerPlate"
	billboard.Size = UDim2.fromScale(9, 1.6)
	billboard.StudsOffsetWorldSpace = Vector3.new(0, 2.4, 0)
	billboard.MaxDistance = 200
	billboard.Parent = head

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.Size = UDim2.fromScale(1, 1)
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.TextStrokeTransparency = 0.4
	label.Text = string.format("%s  [Lv. %d]", player.DisplayName, data.level)
	label.Parent = billboard

	-- Mantém o nível na placa atualizado sem depender de respawn.
	local connection = LevelService.statsChanged:Connect(function(changed)
		if changed ~= player then
			return
		end
		local current = DataService.get(player)
		if current then
			label.Text = string.format("%s  [Lv. %d]", player.DisplayName, current.level)
		end
	end)

	-- Sem isto, cada respawn deixaria um handler órfão vivo até o jogador sair.
	character.Destroying:Connect(function()
		connection:Disconnect()
	end)
end

local function onCharacterAdded(player, character)
	if not DataService.waitFor(player, 20) then
		return
	end

	CharacterService.applyStats(player)
	CharacterService.refreshWeaponModel(player)
	attachNameplate(player, character)

	-- Respawn na ilha onde morreu. Usa defer para acontecer depois de o
	-- SpawnLocation já ter posicionado o personagem.
	local zoneId = lastZoneId[player]
	local zone = zoneId and ZoneConfig.ById[zoneId]
	if zone and not zone.isSpawn then
		task.defer(function()
			if character.Parent and character.PrimaryPart then
				local angle = math.random() * math.pi * 2
				local offset = Vector3.new(math.cos(angle) * 25, 5, math.sin(angle) * 25)
				character:PivotTo(CFrame.new(zone.center + offset))
			end
		end)
	end

	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		humanoid.Died:Connect(function()
			local root = character:FindFirstChild("HumanoidRootPart")
			if root then
				local deathZone = ZoneConfig.zoneAt(root.Position)
				lastZoneId[player] = deathZone and deathZone.id or nil
			end
			Net.event("Notify"):FireClient(player, "Você foi derrotado.", "error")
		end)
	end
end

function CharacterService.start()
	Players.RespawnTime = GameConfig.RespawnTime

	local function hook(player)
		player.CharacterAdded:Connect(function(character)
			task.spawn(onCharacterAdded, player, character)
		end)
		if player.Character then
			task.spawn(onCharacterAdded, player, player.Character)
		end
	end

	for _, player in ipairs(Players:GetPlayers()) do
		hook(player)
	end
	Players.PlayerAdded:Connect(hook)

	Players.PlayerRemoving:Connect(function(player)
		lastZoneId[player] = nil
	end)

	-- Nível ou Defesa mudou: reaplica a vida máxima.
	LevelService.statsChanged:Connect(function(player)
		CharacterService.applyStats(player)
	end)

	-- Resgate de queda. Um jogador que cai fora do mapa (entre ilhas, ou logo
	-- no primeiro segundo do servidor, antes do mundo terminar de nascer) volta
	-- para a ilha inicial em vez de cair para sempre.
	task.spawn(function()
		local spawnZone = ZoneConfig.spawnZone()

		while true do
			task.wait(1)

			for _, player in ipairs(Players:GetPlayers()) do
				local character = player.Character
				local root = character and character:FindFirstChild("HumanoidRootPart")

				if root and root.Position.Y < FALL_RESCUE_Y then
					local angle = math.random() * math.pi * 2
					local offset = Vector3.new(math.cos(angle) * 18, 6, math.sin(angle) * 18)
					character:PivotTo(CFrame.new(spawnZone.center + offset))
					Net.event("Notify"):FireClient(player, "Você caiu do mapa e voltou para a ilha inicial.", "info")
				end
			end
		end
	end)
end

return CharacterService
