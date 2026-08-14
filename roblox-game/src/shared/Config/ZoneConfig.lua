--[[
	ZoneConfig
	O mapa inteiro. O MapBuilder lê esta tabela e constrói as ilhas, o mar,
	os pontos de spawn de NPC, os NPCs de missão e os pontos de fruta — tudo
	por código, sem nenhum asset externo.

	Coordenadas são o centro da ilha no mundo. `radius` é o raio da ilha em
	studs; os offsets de NPC de missão são relativos ao centro.
]]

local ZoneConfig = {}

-- Alto o suficiente para o jogador sair da água andando até a praia (que fica
-- 1,4 stud abaixo do topo da ilha), e baixo o suficiente para as ilhas ainda
-- parecerem ilhas.
ZoneConfig.SeaLevel = -4
ZoneConfig.SeaExtent = 2400 -- lado do quadrado de água gerado no Terrain

ZoneConfig.Zones = {
	{
		id = "StarterIsland",
		name = "Ilha do Início",
		levelRec = 1,
		safe = true, -- PVP desligado, respawn dos jogadores acontece aqui
		isSpawn = true,
		center = Vector3.new(0, 0, 0),
		radius = 115,
		groundColor = Color3.fromRGB(105, 170, 95),
		rockColor = Color3.fromRGB(130, 125, 120),
		decor = 26,
		npcSpawns = {},
		questGivers = {
			{
				id = "kenji",
				name = "Mestre Kenji",
				title = "Instrutor",
				offset = Vector3.new(0, 0, -28),
				shirtColor = Color3.fromRGB(70, 100, 160),
				quests = { "bandit_hunt" },
			},
		},
		fruitSpawns = 4,
	},

	{
		id = "BanditVillage",
		name = "Vila dos Bandidos",
		levelRec = 1,
		safe = false,
		center = Vector3.new(0, 0, -430),
		radius = 135,
		groundColor = Color3.fromRGB(120, 150, 90),
		rockColor = Color3.fromRGB(110, 105, 100),
		decor = 22,
		npcSpawns = {
			{ npcId = "Bandido", count = 9, radius = 95 },
		},
		questGivers = {
			{
				id = "rosa",
				name = "Rosa",
				title = "Aldeã",
				offset = Vector3.new(30, 0, 30),
				shirtColor = Color3.fromRGB(160, 70, 110),
				quests = { "bandit_hunt" },
			},
		},
		fruitSpawns = 4,
	},

	{
		id = "JungleRuins",
		name = "Ruínas da Selva",
		levelRec = 20,
		safe = false,
		center = Vector3.new(440, 0, -370),
		radius = 145,
		groundColor = Color3.fromRGB(70, 130, 75),
		rockColor = Color3.fromRGB(95, 105, 85),
		decor = 34,
		npcSpawns = {
			{ npcId = "MacacoSelvagem", count = 10, radius = 105 },
		},
		questGivers = {
			{
				id = "tembo",
				name = "Tembo",
				title = "Explorador",
				offset = Vector3.new(-34, 0, 24),
				shirtColor = Color3.fromRGB(90, 140, 70),
				quests = { "monkey_hunt" },
			},
		},
		fruitSpawns = 5,
	},

	{
		id = "DesertPort",
		name = "Porto do Deserto",
		levelRec = 40,
		safe = false,
		center = Vector3.new(-450, 0, -430),
		radius = 145,
		groundColor = Color3.fromRGB(220, 195, 135),
		rockColor = Color3.fromRGB(190, 170, 130),
		decor = 18,
		npcSpawns = {
			{ npcId = "PirataNovato", count = 10, radius = 105 },
		},
		questGivers = {
			{
				id = "farid",
				name = "Farid",
				title = "Mercador",
				offset = Vector3.new(28, 0, -30),
				shirtColor = Color3.fromRGB(180, 140, 60),
				quests = { "pirate_hunt" },
			},
		},
		fruitSpawns = 5,
	},

	{
		id = "MarineFortress",
		name = "Fortaleza da Marinha",
		levelRec = 70,
		safe = false,
		center = Vector3.new(70, 0, -900),
		radius = 165,
		groundColor = Color3.fromRGB(150, 150, 155),
		rockColor = Color3.fromRGB(200, 200, 205),
		decor = 20,
		npcSpawns = {
			{ npcId = "SoldadoMarinha", count = 11, radius = 120 },
			{ npcId = "CapitaoMarinha", count = 1, radius = 25 },
		},
		questGivers = {
			{
				id = "iva",
				name = "Iva",
				title = "Espiã",
				offset = Vector3.new(-40, 0, 40),
				shirtColor = Color3.fromRGB(60, 70, 90),
				quests = { "marine_hunt", "captain_raid" },
			},
		},
		fruitSpawns = 6,
	},
}

-- Índice por id, montado uma vez no require.
ZoneConfig.ById = {}
for _, zone in ipairs(ZoneConfig.Zones) do
	ZoneConfig.ById[zone.id] = zone
end

function ZoneConfig.spawnZone()
	for _, zone in ipairs(ZoneConfig.Zones) do
		if zone.isSpawn then
			return zone
		end
	end
	return ZoneConfig.Zones[1]
end

-- Zona cuja área contém a posição, ou nil se estiver no mar.
function ZoneConfig.zoneAt(position)
	for _, zone in ipairs(ZoneConfig.Zones) do
		local dx = position.X - zone.center.X
		local dz = position.Z - zone.center.Z
		if (dx * dx + dz * dz) <= (zone.radius * zone.radius) then
			return zone
		end
	end
	return nil
end

-- Uma zona segura desliga PVP para quem está dentro dela. O mar conta como
-- área livre, então nil = PVP liberado.
function ZoneConfig.isSafeAt(position)
	local zone = ZoneConfig.zoneAt(position)
	return zone ~= nil and zone.safe == true
end

return ZoneConfig
