--[[
	MapBuilder
	Constrói o mundo inteiro por código a partir do ZoneConfig: ilhas, mar,
	decoração, cais de viagem, marcadores de spawn de inimigo e pontos de fruta.

	Por que por código: você consegue jogar e testar sem modelar nada no Studio.
	Quando quiser um mapa feito à mão, troque a chamada de build() por um
	carregamento de modelos e mantenha só a criação dos marcadores — os
	services só dependem dos marcadores, não da geometria.

	A seed é fixa: todo servidor gera exatamente o mesmo mapa.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local CollectionService = game:GetService("CollectionService")
local Lighting = game:GetService("Lighting")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local ZoneConfig = require(Shared.Config.ZoneConfig)
local NpcConfig = require(Shared.Config.NpcConfig)

local RigBuilder = require(script.Parent.RigBuilder)

local MapBuilder = {}

local MAP_SEED = 20260814
local ISLAND_THICKNESS = 24
local GENERATE_OCEAN = true

MapBuilder.Tags = {
	NpcSpawn = "NpcSpawn",
	FruitSpawn = "FruitSpawn",
	QuestGiver = "QuestGiver",
	TravelPad = "TravelPad",
}

local random = Random.new(MAP_SEED)

local function newFolder(name, parent)
	local folder = Instance.new("Folder")
	folder.Name = name
	folder.Parent = parent
	return folder
end

local function newPart(props, parent)
	local part = Instance.new("Part")
	part.Anchored = true
	part.Material = Enum.Material.SmoothPlastic
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth

	for key, value in pairs(props) do
		part[key] = value
	end

	part.Parent = parent
	return part
end

-- Parts cilíndricas do Roblox têm o eixo do cilindro em X. Esta rotação o
-- deixa em pé (eixo Y), que é o que queremos para ilhas e troncos.
local UPRIGHT_CYLINDER = CFrame.fromEulerAnglesXYZ(0, 0, math.pi / 2)

local function cylinder(props, parent)
	props.Shape = Enum.PartType.Cylinder
	return newPart(props, parent)
end

-- Ponto aleatório no disco da ilha, entre minFactor e maxFactor do raio.
local function pointInIsland(zone, minFactor, maxFactor)
	local angle = random:NextNumber(0, math.pi * 2)
	local distance = zone.radius * random:NextNumber(minFactor, maxFactor)
	return zone.center + Vector3.new(math.cos(angle) * distance, 0, math.sin(angle) * distance)
end

-- Geometria ------------------------------------------------------------------

local function buildIsland(zone, parent)
	local group = newFolder(zone.id, parent)

	-- Praia: disco um pouco maior e mais raso, aparece como borda de areia.
	cylinder({
		Name = "Beach",
		Size = Vector3.new(ISLAND_THICKNESS * 0.7, (zone.radius + 16) * 2, (zone.radius + 16) * 2),
		CFrame = CFrame.new(zone.center - Vector3.new(0, ISLAND_THICKNESS * 0.35 + 1.4, 0)) * UPRIGHT_CYLINDER,
		Color = Color3.fromRGB(232, 214, 170),
		Material = Enum.Material.Sand,
	}, group)

	cylinder({
		Name = "Ground",
		Size = Vector3.new(ISLAND_THICKNESS, zone.radius * 2, zone.radius * 2),
		CFrame = CFrame.new(zone.center - Vector3.new(0, ISLAND_THICKNESS / 2, 0)) * UPRIGHT_CYLINDER,
		Color = zone.groundColor,
		Material = Enum.Material.Grass,
	}, group)

	return group
end

local function buildTree(position, zone, parent)
	local height = random:NextNumber(12, 20)

	cylinder({
		Name = "Trunk",
		Size = Vector3.new(height, 2.6, 2.6),
		CFrame = CFrame.new(position + Vector3.new(0, height / 2, 0)) * UPRIGHT_CYLINDER,
		Color = Color3.fromRGB(96, 68, 46),
		Material = Enum.Material.Wood,
	}, parent)

	newPart({
		Name = "Leaves",
		Shape = Enum.PartType.Ball,
		Size = Vector3.new(1, 1, 1) * random:NextNumber(13, 18),
		CFrame = CFrame.new(position + Vector3.new(0, height + 2, 0)),
		Color = zone.groundColor:Lerp(Color3.fromRGB(30, 90, 40), 0.45),
		Material = Enum.Material.Grass,
		CanCollide = false,
	}, parent)
end

local function buildRock(position, zone, parent)
	local size = random:NextNumber(6, 13)
	newPart({
		Name = "Rock",
		Shape = Enum.PartType.Ball,
		Size = Vector3.new(1, 1, 1) * size,
		-- Enterra parte da esfera para parecer uma pedra saindo do chão.
		CFrame = CFrame.new(position + Vector3.new(0, size * 0.3, 0)),
		Color = zone.rockColor,
		Material = Enum.Material.Slate,
	}, parent)
end

local function buildCrate(position, parent)
	local size = random:NextNumber(4, 7)
	newPart({
		Name = "Crate",
		Size = Vector3.new(size, size, size),
		CFrame = CFrame.new(position + Vector3.new(0, size / 2, 0))
			* CFrame.fromEulerAnglesXYZ(0, random:NextNumber(0, math.pi * 2), 0),
		Color = Color3.fromRGB(150, 110, 70),
		Material = Enum.Material.WoodPlanks,
	}, parent)
end

local function buildDecor(zone, parent)
	local group = newFolder("Decor", parent)

	for _ = 1, zone.decor do
		local position = pointInIsland(zone, 0.32, 0.92)
		local roll = random:NextNumber()

		if roll < 0.55 then
			buildTree(position, zone, group)
		elseif roll < 0.82 then
			buildRock(position, zone, group)
		else
			buildCrate(position, group)
		end
	end
end

-- Marcadores -----------------------------------------------------------------

local function buildNpcSpawns(zone, markersFolder)
	for _, spawnDef in ipairs(zone.npcSpawns) do
		local npcDef = NpcConfig.get(spawnDef.npcId)
		if not npcDef then
			warn(string.format("[MapBuilder] zona %s referencia NPC inexistente: %s", zone.id, spawnDef.npcId))
			continue
		end

		for index = 1, spawnDef.count do
			local angle = (index / spawnDef.count) * math.pi * 2 + random:NextNumber(-0.3, 0.3)
			local distance = spawnDef.radius * random:NextNumber(0.35, 1)
			local position = zone.center + Vector3.new(math.cos(angle) * distance, 0, math.sin(angle) * distance)

			local marker = newPart({
				Name = string.format("%s_%s_%d", zone.id, spawnDef.npcId, index),
				Size = Vector3.new(2, 2, 2),
				CFrame = CFrame.new(position),
				Transparency = 1,
				CanCollide = false,
				CanQuery = false,
				CanTouch = false,
			}, markersFolder)

			marker:SetAttribute("NpcId", spawnDef.npcId)
			marker:SetAttribute("ZoneId", zone.id)
			CollectionService:AddTag(marker, MapBuilder.Tags.NpcSpawn)
		end
	end
end

local function buildFruitSpawns(zone, markersFolder)
	for index = 1, (zone.fruitSpawns or 0) do
		local position = pointInIsland(zone, 0.2, 0.88)

		local marker = newPart({
			Name = string.format("%s_Fruit_%d", zone.id, index),
			Size = Vector3.new(2, 2, 2),
			CFrame = CFrame.new(position + Vector3.new(0, 3, 0)),
			Transparency = 1,
			CanCollide = false,
			CanQuery = false,
			CanTouch = false,
		}, markersFolder)

		marker:SetAttribute("ZoneId", zone.id)
		CollectionService:AddTag(marker, MapBuilder.Tags.FruitSpawn)
	end
end

local function buildQuestGivers(zone, parent)
	for _, giver in ipairs(zone.questGivers) do
		local position = zone.center + giver.offset

		local model, humanoid = RigBuilder.build({
			name = giver.name,
			shirtColor = giver.shirtColor,
			maxHealth = 100,
			walkSpeed = 0,
			anchored = true,
		})

		-- NPCs de missão são intocáveis por construção: não recebem a tag de
		-- inimigo, e o CombatService só aplica dano em jogadores e em NPCs
		-- marcados. Não mexemos em MaxHealth (zerar dispara o estado de morte
		-- do Humanoid e desmonta o rig).
		model:SetAttribute("NoHealthBar", true)

		RigBuilder.placeOnGround(model, position, 1, zone.center - position)
		RigBuilder.attachNameplate(model, humanoid, giver.name, giver.title, Color3.fromRGB(255, 225, 130))

		local prompt = Instance.new("ProximityPrompt")
		prompt.ActionText = "Missões"
		prompt.ObjectText = giver.name
		prompt.HoldDuration = 0
		prompt.MaxActivationDistance = 12
		prompt.RequiresLineOfSight = false
		prompt.Parent = model:FindFirstChild("Torso")

		model:SetAttribute("GiverId", giver.id)
		model:SetAttribute("ZoneId", zone.id)
		CollectionService:AddTag(model, MapBuilder.Tags.QuestGiver)

		model.Parent = parent
	end
end

-- Cais de viagem: um pad por destino, em volta da borda da ilha. É o que
-- substitui os barcos por enquanto — sem isto as ilhas ficariam inalcançáveis.
local function buildTravelPads(zone, parent)
	local destinations = {}
	for _, other in ipairs(ZoneConfig.Zones) do
		if other.id ~= zone.id then
			table.insert(destinations, other)
		end
	end

	local group = newFolder(zone.id, parent)

	for index, destination in ipairs(destinations) do
		-- Espalha os pads num arco na direção geral do destino.
		local direction = (destination.center - zone.center)
		local flat = Vector3.new(direction.X, 0, direction.Z)
		local baseAngle = math.atan2(flat.Z, flat.X)
		local spread = (index - (#destinations + 1) / 2) * 0.12
		local angle = baseAngle + spread
		local position = zone.center
			+ Vector3.new(math.cos(angle) * (zone.radius - 14), 0, math.sin(angle) * (zone.radius - 14))

		local pad = newPart({
			Name = "To_" .. destination.id,
			Size = Vector3.new(12, 1, 12),
			CFrame = CFrame.new(position + Vector3.new(0, 0.5, 0)),
			Color = Color3.fromRGB(120, 95, 65),
			Material = Enum.Material.WoodPlanks,
		}, group)

		local billboard = Instance.new("BillboardGui")
		billboard.Size = UDim2.fromScale(11, 2.4)
		billboard.StudsOffsetWorldSpace = Vector3.new(0, 5, 0)
		billboard.MaxDistance = 140
		billboard.Parent = pad

		local label = Instance.new("TextLabel")
		label.BackgroundTransparency = 1
		label.Size = UDim2.fromScale(1, 1)
		label.Font = Enum.Font.GothamBold
		label.TextScaled = true
		label.Text = string.format("%s\nLv. %d+", destination.name, destination.levelRec)
		label.TextColor3 = Color3.fromRGB(255, 245, 215)
		label.TextStrokeTransparency = 0.3
		label.Parent = billboard

		local prompt = Instance.new("ProximityPrompt")
		prompt.ActionText = "Viajar"
		prompt.ObjectText = destination.name
		prompt.HoldDuration = 1
		prompt.MaxActivationDistance = 10
		prompt.RequiresLineOfSight = false
		prompt.Parent = pad

		pad:SetAttribute("DestinationZone", destination.id)
		CollectionService:AddTag(pad, MapBuilder.Tags.TravelPad)
	end
end

local function buildOcean()
	local minX, maxX = math.huge, -math.huge
	local minZ, maxZ = math.huge, -math.huge

	for _, zone in ipairs(ZoneConfig.Zones) do
		minX = math.min(minX, zone.center.X - zone.radius)
		maxX = math.max(maxX, zone.center.X + zone.radius)
		minZ = math.min(minZ, zone.center.Z - zone.radius)
		maxZ = math.max(maxZ, zone.center.Z + zone.radius)
	end

	local padding = 260
	local sizeX = math.min((maxX - minX) + padding * 2, ZoneConfig.SeaExtent)
	local sizeZ = math.min((maxZ - minZ) + padding * 2, ZoneConfig.SeaExtent)
	local centerX = (minX + maxX) / 2
	local centerZ = (minZ + maxZ) / 2

	local depth = 26
	local top = ZoneConfig.SeaLevel
	local centerY = top - depth / 2

	local ok, err = pcall(function()
		Workspace.Terrain:FillBlock(
			CFrame.new(centerX, centerY, centerZ),
			Vector3.new(sizeX, depth, sizeZ),
			Enum.Material.Water
		)
	end)

	if not ok then
		warn("[MapBuilder] não foi possível gerar o mar: " .. tostring(err))
	end
end

-- Céu de fim de tarde tropical. Feito por código para que o arquivo de
-- projeto do Rojo não precise carregar propriedades de Lighting.
local function configureLighting()
	Lighting.Ambient = Color3.fromRGB(72, 74, 88)
	Lighting.OutdoorAmbient = Color3.fromRGB(122, 128, 145)
	Lighting.Brightness = 2.2
	Lighting.ClockTime = 14.5
	Lighting.GeographicLatitude = 8
	Lighting.ExposureCompensation = 0.15
	Lighting.EnvironmentDiffuseScale = 0.4
	Lighting.EnvironmentSpecularScale = 0.4

	local atmosphere = Lighting:FindFirstChildOfClass("Atmosphere")
	if not atmosphere then
		atmosphere = Instance.new("Atmosphere")
		atmosphere.Parent = Lighting
	end
	atmosphere.Density = 0.33
	atmosphere.Offset = 0.2
	atmosphere.Haze = 1.7
	atmosphere.Glare = 0.2
	atmosphere.Color = Color3.fromRGB(210, 220, 235)
	atmosphere.Decay = Color3.fromRGB(110, 130, 160)
end

-- Entrada pública ------------------------------------------------------------

function MapBuilder.build()
	configureLighting()

	-- Rebuild limpo: útil quando o Rojo sincroniza e o servidor reinicia.
	local existing = Workspace:FindFirstChild("World")
	if existing then
		existing:Destroy()
	end

	local world = newFolder("World", Workspace)
	local zonesFolder = newFolder("Zones", world)
	local markersFolder = newFolder("Markers", world)
	local npcSpawnFolder = newFolder("NpcSpawns", markersFolder)
	local fruitSpawnFolder = newFolder("FruitSpawns", markersFolder)
	local questGiverFolder = newFolder("QuestGivers", world)
	local travelFolder = newFolder("TravelPads", world)

	-- Criada aqui para que NpcService e FruitService só precisem procurá-la.
	newFolder("Npcs", world)
	newFolder("Fruits", world)

	for _, zone in ipairs(ZoneConfig.Zones) do
		local group = buildIsland(zone, zonesFolder)
		buildDecor(zone, group)
		buildNpcSpawns(zone, npcSpawnFolder)
		buildFruitSpawns(zone, fruitSpawnFolder)
		buildQuestGivers(zone, questGiverFolder)
		buildTravelPads(zone, travelFolder)

		if zone.isSpawn then
			local spawnLocation = Instance.new("SpawnLocation")
			spawnLocation.Name = "PlayerSpawn"
			spawnLocation.Anchored = true
			spawnLocation.Size = Vector3.new(20, 1, 20)
			spawnLocation.CFrame = CFrame.new(zone.center + Vector3.new(0, 0.5, 20))
			spawnLocation.Color = Color3.fromRGB(240, 240, 245)
			spawnLocation.Material = Enum.Material.Marble
			spawnLocation.Duration = 0 -- sem forcefield: PVP é decidido por zona
			spawnLocation.Parent = group
		end
	end

	-- O mar vem por último de propósito. Preencher o Terrain leva alguns
	-- segundos, e se ele viesse antes o primeiro jogador poderia entrar antes
	-- das ilhas existirem e cair na água.
	if GENERATE_OCEAN then
		buildOcean()
	end

	return world
end

return MapBuilder
