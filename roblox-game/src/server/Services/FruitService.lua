--[[
	FruitService
	Frutas nascem sozinhas pelo mapa, em pontos definidos pelo MapBuilder, e
	desaparecem se ninguém pegar. Comer substitui a fruta atual.
]]

local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local FruitConfig = require(Shared.Config.FruitConfig)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)

local FruitService = {}

-- Intervalo curto de propósito: facilita testar. Para um jogo publicado,
-- 900-1800 segundos é o normal.
local SPAWN_INTERVAL = 240
local DESPAWN_AFTER = 300
local MAX_ACTIVE = 3

-- Raridades que anunciam para o servidor inteiro quando aparecem.
local ANNOUNCED_RARITIES = {
	["Rara"] = true,
	["Lendária"] = true,
	["Mítica"] = true,
}

local random = Random.new(os.time())
local activeCount = 0
local markers = {}
local fruitFolder = nil

local function broadcast(text, kind)
	for _, player in ipairs(Players:GetPlayers()) do
		Net.event("Notify"):FireClient(player, text, kind or "info")
	end
end

local function onEaten(player, fruitId, model)
	local data = DataService.get(player)
	if not data or not model.Parent then
		return
	end

	local fruit = FruitConfig.get(fruitId)
	if not fruit then
		return
	end

	local previous = data.fruit
	data.fruit = fruitId

	-- Destrói antes de notificar: evita dois jogadores comerem a mesma fruta
	-- se acionarem o prompt no mesmo frame.
	model:Destroy()
	activeCount = math.max(0, activeCount - 1)

	if previous and previous ~= fruitId then
		local previousFruit = FruitConfig.get(previous)
		Net.event("Notify"):FireClient(
			player,
			string.format("Você comeu a %s e perdeu a %s.", fruit.name, previousFruit and previousFruit.name or previous),
			"success"
		)
	else
		Net.event("Notify"):FireClient(player, string.format("Você comeu a %s!", fruit.name), "success")
	end

	DataService.push(player)
end

local function spawnFruit()
	if activeCount >= MAX_ACTIVE or #markers == 0 or not fruitFolder then
		return
	end

	local marker = markers[random:NextInteger(1, #markers)]
	if not marker.Parent then
		return
	end

	local fruitId = FruitConfig.roll(random)
	local fruit = FruitConfig.get(fruitId)

	local model = Instance.new("Part")
	model.Name = "Fruit_" .. fruitId
	model.Shape = Enum.PartType.Ball
	model.Size = Vector3.new(3, 3, 3)
	model.Anchored = true
	model.CanCollide = false
	model.Material = Enum.Material.Neon
	model.Color = fruit.color
	model.CFrame = CFrame.new(marker.Position)
	model.Parent = fruitFolder

	local light = Instance.new("PointLight")
	light.Color = fruit.color
	light.Brightness = 3
	light.Range = 22
	light.Parent = model

	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.fromScale(10, 2.4)
	billboard.StudsOffsetWorldSpace = Vector3.new(0, 3.2, 0)
	billboard.MaxDistance = 180
	billboard.AlwaysOnTop = true
	billboard.Parent = model

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.Size = UDim2.fromScale(1, 1)
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.Text = string.format("%s\n%s", fruit.name, fruit.rarity)
	label.TextColor3 = FruitConfig.RarityColor[fruit.rarity] or Color3.fromRGB(255, 255, 255)
	label.TextStrokeTransparency = 0.3
	label.Parent = billboard

	local prompt = Instance.new("ProximityPrompt")
	prompt.ActionText = "Comer"
	prompt.ObjectText = fruit.name
	prompt.HoldDuration = 1
	prompt.MaxActivationDistance = 9
	prompt.RequiresLineOfSight = false
	prompt.Parent = model

	prompt.Triggered:Connect(function(player)
		onEaten(player, fruitId, model)
	end)

	-- Sobe e desce em loop para chamar atenção de longe.
	TweenService:Create(
		model,
		TweenInfo.new(1.8, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true),
		{ CFrame = model.CFrame + Vector3.new(0, 1.6, 0) }
	):Play()

	activeCount += 1

	if ANNOUNCED_RARITIES[fruit.rarity] then
		broadcast(string.format("Uma %s (%s) apareceu no mapa!", fruit.name, fruit.rarity), "success")
	end

	task.delay(DESPAWN_AFTER, function()
		if model.Parent then
			model:Destroy()
			activeCount = math.max(0, activeCount - 1)
		end
	end)
end

function FruitService.start()
	local world = Workspace:WaitForChild("World", 30)
	assert(world, "FruitService: Workspace.World não existe. MapBuilder.build() rodou?")
	fruitFolder = world:WaitForChild("Fruits")

	markers = CollectionService:GetTagged("FruitSpawn")

	task.spawn(function()
		-- Uma fruta já no chão no boot: dá o que testar sem esperar.
		task.wait(5)
		spawnFruit()

		while true do
			task.wait(SPAWN_INTERVAL)
			spawnFruit()
		end
	end)
end

return FruitService
