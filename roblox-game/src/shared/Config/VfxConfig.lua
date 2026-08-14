--[[
	VfxConfig
	A identidade visual de cada elemento, como dados. Ajustar o visual do jogo
	é mexer aqui — nenhum número de efeito está escondido no código.

	Sobre texturas: `soft = ""` é a textura padrão do ParticleEmitter, que vem
	no cliente e sempre funciona. As outras são caminhos `rbxasset://` que
	acompanham o Roblox. Se alguma sumir numa versão futura do cliente, a
	partícula fica invisível — nesse caso troque o valor por "" e ela volta
	como bolha suave.

	Para usar texturas próprias: suba as imagens no Roblox e troque os valores
	de `Textures` por "rbxassetid://SEU_ID". É o único ponto que precisa mudar,
	e é o que separa este visual de um VFX de jogo grande.
]]

local VfxConfig = {}

-- Orçamento ------------------------------------------------------------------

-- Além desta distância da câmera nenhum efeito é criado. Numa luta com 6
-- jogadores do outro lado da ilha, isto é a diferença entre 60 e 20 FPS.
VfxConfig.CullDistance = 340

-- Entre ReducedDistance e CullDistance o efeito sai em versão leve: núcleo e
-- luz, sem partículas nem estilhaços.
VfxConfig.ReducedDistance = 170

-- Teto de efeitos completos simultâneos. Acima disso, novos efeitos entram na
-- versão leve em vez de serem descartados (é melhor ver algo fraco do que ver
-- o golpe não sair).
VfxConfig.MaxConcurrent = 26

-- O Roblox reclama acima de ~31 Highlights ativos.
VfxConfig.MaxHighlights = 8

VfxConfig.Textures = {
	soft = "",
	spark = "rbxasset://textures/particles/sparkles_main.dds",
	smoke = "rbxasset://textures/particles/smoke_main.dds",
}

-- Camera shake ---------------------------------------------------------------

VfxConfig.Shake = {
	-- Intensidade cai com o quadrado da distância; nada tremendo do outro lado
	-- do mapa.
	falloff = 90,
	maxOffset = 1.6,
	maxRoll = 0.035,
}

-- Elementos ------------------------------------------------------------------
--[[
	Campos que o Effects lê:

	color, accent   Color3
	light           { brightness, range, duration }
	core            { growth, duration, transparency, material }  esfera/elipsoide
	disc            { duration, thickness } | nil   onda no chão
	layers          lista de camadas de partícula:
	                { texture, count, lifetime={min,max}, speed={min,max},
	                  spread, size={{t,v}..}, alpha={{t,v}..},
	                  colors={{t,Color3}..} | nil, accel=Vector3, drag,
	                  lightEmission, rotSpeed={min,max}, squash }
	shards          { count, size=Vector3, speed, spin, duration } | nil
	bolts           { count, segments, width, jitter, duration } | nil
]]

VfxConfig.Elements = {
	--------------------------------------------------------------------------
	Fire = {
		color = Color3.fromRGB(255, 120, 35),
		accent = Color3.fromRGB(255, 225, 130),
		light = { brightness = 6, range = 34, duration = 0.35 },
		core = { growth = 1.5, duration = 0.3, transparency = 0.25, material = Enum.Material.Neon },
		disc = { duration = 0.4, thickness = 0.6 },
		layers = {
			{
				-- Labaredas: sobem, encolhem e clareiam no fim.
				texture = "soft",
				count = 26,
				lifetime = { 0.35, 0.7 },
				speed = { 22, 42 },
				spread = 180,
				size = { { 0, 0.6 }, { 0.3, 2.6 }, { 1, 0 } },
				alpha = { { 0, 0.15 }, { 0.7, 0.45 }, { 1, 1 } },
				colors = {
					{ 0, Color3.fromRGB(255, 240, 190) },
					{ 0.45, Color3.fromRGB(255, 130, 40) },
					{ 1, Color3.fromRGB(120, 30, 15) },
				},
				accel = Vector3.new(0, 34, 0),
				drag = 2.5,
				lightEmission = 0.9,
				rotSpeed = { -140, 140 },
			},
			{
				-- Fumaça: lenta, escura, fica para trás.
				texture = "smoke",
				count = 9,
				lifetime = { 0.8, 1.4 },
				speed = { 6, 14 },
				spread = 180,
				size = { { 0, 1.4 }, { 1, 6 } },
				alpha = { { 0, 0.55 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(70, 60, 55) }, { 1, Color3.fromRGB(35, 32, 30) } },
				accel = Vector3.new(0, 12, 0),
				drag = 3.5,
				lightEmission = 0,
				rotSpeed = { -50, 50 },
			},
			{
				texture = "spark",
				count = 14,
				lifetime = { 0.4, 0.9 },
				speed = { 40, 80 },
				spread = 180,
				size = { { 0, 0.9 }, { 1, 0 } },
				alpha = { { 0, 0 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 220, 140) }, { 1, Color3.fromRGB(255, 110, 40) } },
				accel = Vector3.new(0, -40, 0),
				drag = 1,
				lightEmission = 1,
				rotSpeed = { -300, 300 },
			},
		},
	},

	--------------------------------------------------------------------------
	Ice = {
		color = Color3.fromRGB(150, 225, 255),
		accent = Color3.fromRGB(245, 252, 255),
		light = { brightness = 4, range = 30, duration = 0.5 },
		core = { growth = 1.35, duration = 0.45, transparency = 0.4, material = Enum.Material.Glass },
		disc = { duration = 0.6, thickness = 0.4 },
		-- A assinatura do gelo: pedaços sólidos que voam e ficam girando.
		shards = { count = 12, size = Vector3.new(0.6, 0.6, 2.4), speed = 46, spin = 12, duration = 0.85 },
		layers = {
			{
				texture = "soft",
				count = 20,
				lifetime = { 0.4, 0.8 },
				speed = { 20, 40 },
				spread = 180,
				size = { { 0, 0.5 }, { 0.35, 2.2 }, { 1, 0.2 } },
				alpha = { { 0, 0.25 }, { 1, 1 } },
				colors = {
					{ 0, Color3.fromRGB(250, 253, 255) },
					{ 1, Color3.fromRGB(120, 190, 240) },
				},
				accel = Vector3.new(0, -8, 0),
				drag = 3,
				lightEmission = 0.65,
				rotSpeed = { -90, 90 },
			},
			{
				-- Névoa fria que desce e assenta.
				texture = "smoke",
				count = 10,
				lifetime = { 1, 1.8 },
				speed = { 5, 12 },
				spread = 180,
				size = { { 0, 1.6 }, { 1, 5.5 } },
				alpha = { { 0, 0.7 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(215, 240, 255) }, { 1, Color3.fromRGB(160, 200, 230) } },
				accel = Vector3.new(0, -6, 0),
				drag = 4,
				lightEmission = 0.3,
				rotSpeed = { -30, 30 },
			},
			{
				texture = "spark",
				count = 16,
				lifetime = { 0.5, 1 },
				speed = { 30, 60 },
				spread = 180,
				size = { { 0, 0.8 }, { 1, 0 } },
				alpha = { { 0, 0 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 255, 255) }, { 1, Color3.fromRGB(150, 220, 255) } },
				accel = Vector3.new(0, -25, 0),
				drag = 1.5,
				lightEmission = 1,
				rotSpeed = { -200, 200 },
			},
		},
	},

	--------------------------------------------------------------------------
	Sand = {
		color = Color3.fromRGB(220, 185, 115),
		accent = Color3.fromRGB(250, 230, 180),
		light = { brightness = 2, range = 22, duration = 0.3 },
		core = { growth = 1.6, duration = 0.35, transparency = 0.6, material = Enum.Material.Sand },
		disc = { duration = 0.7, thickness = 0.5 },
		shards = { count = 8, size = Vector3.new(1, 1, 1), speed = 34, spin = 8, duration = 1 },
		layers = {
			{
				-- Grãos: muitos, rápidos, com arrasto alto para assentarem.
				texture = "soft",
				count = 40,
				lifetime = { 0.6, 1.3 },
				speed = { 26, 52 },
				spread = 180,
				size = { { 0, 0.4 }, { 0.5, 1.6 }, { 1, 0.3 } },
				alpha = { { 0, 0.3 }, { 1, 1 } },
				colors = {
					{ 0, Color3.fromRGB(245, 220, 165) },
					{ 1, Color3.fromRGB(160, 125, 80) },
				},
				accel = Vector3.new(0, -55, 0),
				drag = 5,
				lightEmission = 0.1,
				rotSpeed = { -120, 120 },
			},
			{
				-- Poeira suspensa: é o que dá peso ao golpe.
				texture = "smoke",
				count = 14,
				lifetime = { 1.2, 2.2 },
				speed = { 8, 20 },
				spread = 180,
				size = { { 0, 2 }, { 1, 9 } },
				alpha = { { 0, 0.5 }, { 0.6, 0.75 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(215, 195, 160) }, { 1, Color3.fromRGB(150, 135, 110) } },
				accel = Vector3.new(0, -4, 0),
				drag = 4.5,
				lightEmission = 0,
				rotSpeed = { -40, 40 },
			},
		},
	},

	--------------------------------------------------------------------------
	Lightning = {
		color = Color3.fromRGB(255, 240, 120),
		accent = Color3.fromRGB(190, 220, 255),
		-- Muito brilho, muito curto: é o que faz raio parecer raio.
		light = { brightness = 12, range = 46, duration = 0.14 },
		core = { growth = 1.2, duration = 0.16, transparency = 0.1, material = Enum.Material.Neon },
		disc = { duration = 0.22, thickness = 0.3 },
		bolts = { count = 6, segments = 4, width = 0.55, jitter = 0.35, duration = 0.16 },
		layers = {
			{
				texture = "spark",
				count = 30,
				lifetime = { 0.2, 0.5 },
				speed = { 60, 130 },
				spread = 180,
				size = { { 0, 1.1 }, { 1, 0 } },
				alpha = { { 0, 0 }, { 0.8, 0.2 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 255, 235) }, { 1, Color3.fromRGB(255, 225, 90) } },
				accel = Vector3.new(0, -20, 0),
				drag = 2,
				lightEmission = 1,
				rotSpeed = { -400, 400 },
			},
			{
				texture = "soft",
				count = 12,
				lifetime = { 0.15, 0.3 },
				speed = { 30, 70 },
				spread = 180,
				size = { { 0, 1.8 }, { 1, 0 } },
				alpha = { { 0, 0.1 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 255, 255) }, { 1, Color3.fromRGB(160, 200, 255) } },
				accel = Vector3.new(),
				drag = 1,
				lightEmission = 1,
				rotSpeed = { -100, 100 },
			},
		},
	},

	--------------------------------------------------------------------------
	Light = {
		color = Color3.fromRGB(255, 250, 210),
		accent = Color3.fromRGB(255, 255, 255),
		light = { brightness = 14, range = 52, duration = 0.3 },
		core = { growth = 1.9, duration = 0.28, transparency = 0.05, material = Enum.Material.Neon },
		-- Luz é limpa: onda larga e fina, quase sem partícula.
		disc = { duration = 0.45, thickness = 0.25 },
		bolts = { count = 3, segments = 2, width = 0.3, jitter = 0.12, duration = 0.2 },
		layers = {
			{
				texture = "soft",
				count = 16,
				lifetime = { 0.25, 0.5 },
				speed = { 70, 120 },
				spread = 180,
				size = { { 0, 0.4 }, { 0.25, 2 }, { 1, 0 } },
				alpha = { { 0, 0 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 255, 255) }, { 1, Color3.fromRGB(255, 240, 175) } },
				accel = Vector3.new(),
				drag = 2.5,
				lightEmission = 1,
				rotSpeed = { -60, 60 },
			},
			{
				texture = "spark",
				count = 20,
				lifetime = { 0.3, 0.7 },
				speed = { 50, 110 },
				spread = 180,
				size = { { 0, 0.7 }, { 1, 0 } },
				alpha = { { 0, 0 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 255, 245) }, { 1, Color3.fromRGB(255, 235, 160) } },
				accel = Vector3.new(),
				drag = 1.5,
				lightEmission = 1,
				rotSpeed = { -250, 250 },
			},
		},
	},

	--------------------------------------------------------------------------
	-- Elementos de arma. Mais discretos de propósito: o M1 sai muitas vezes
	-- por segundo, e efeito grande em ataque rápido vira poluição visual.
	--------------------------------------------------------------------------
	Physical = {
		color = Color3.fromRGB(255, 235, 205),
		accent = Color3.fromRGB(255, 255, 255),
		light = { brightness = 1.5, range = 12, duration = 0.1 },
		core = { growth = 0.8, duration = 0.14, transparency = 0.5, material = Enum.Material.Neon },
		layers = {
			{
				texture = "soft",
				count = 8,
				lifetime = { 0.15, 0.3 },
				speed = { 26, 46 },
				spread = 140,
				size = { { 0, 0.5 }, { 0.4, 1.3 }, { 1, 0 } },
				alpha = { { 0, 0.25 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 250, 240) }, { 1, Color3.fromRGB(220, 200, 175) } },
				accel = Vector3.new(0, -30, 0),
				drag = 3,
				lightEmission = 0.5,
				rotSpeed = { -120, 120 },
			},
		},
	},

	Steel = {
		color = Color3.fromRGB(215, 235, 255),
		accent = Color3.fromRGB(255, 255, 255),
		light = { brightness = 2.5, range = 16, duration = 0.1 },
		core = { growth = 0.9, duration = 0.13, transparency = 0.35, material = Enum.Material.Neon },
		layers = {
			{
				texture = "spark",
				count = 12,
				lifetime = { 0.2, 0.4 },
				speed = { 45, 85 },
				spread = 90,
				size = { { 0, 0.7 }, { 1, 0 } },
				alpha = { { 0, 0 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 255, 255) }, { 1, Color3.fromRGB(160, 200, 255) } },
				accel = Vector3.new(0, -55, 0),
				drag = 1.2,
				lightEmission = 1,
				rotSpeed = { -320, 320 },
			},
		},
	},

	Gunpowder = {
		color = Color3.fromRGB(255, 205, 120),
		accent = Color3.fromRGB(255, 240, 200),
		light = { brightness = 5, range = 18, duration = 0.08 },
		core = { growth = 0.7, duration = 0.1, transparency = 0.3, material = Enum.Material.Neon },
		layers = {
			{
				texture = "spark",
				count = 10,
				lifetime = { 0.12, 0.3 },
				speed = { 50, 95 },
				spread = 45,
				size = { { 0, 0.8 }, { 1, 0 } },
				alpha = { { 0, 0 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(255, 245, 200) }, { 1, Color3.fromRGB(255, 150, 60) } },
				accel = Vector3.new(0, -30, 0),
				drag = 1.5,
				lightEmission = 1,
				rotSpeed = { -300, 300 },
			},
			{
				texture = "smoke",
				count = 5,
				lifetime = { 0.5, 1 },
				speed = { 8, 18 },
				spread = 60,
				size = { { 0, 0.8 }, { 1, 3.5 } },
				alpha = { { 0, 0.6 }, { 1, 1 } },
				colors = { { 0, Color3.fromRGB(90, 85, 80) }, { 1, Color3.fromRGB(55, 52, 50) } },
				accel = Vector3.new(0, 8, 0),
				drag = 4,
				lightEmission = 0,
				rotSpeed = { -60, 60 },
			},
		},
	},
}

VfxConfig.DefaultElement = "Physical"

function VfxConfig.element(elementId)
	return VfxConfig.Elements[elementId] or VfxConfig.Elements[VfxConfig.DefaultElement]
end

function VfxConfig.texture(name)
	local value = VfxConfig.Textures[name or "soft"]
	return value ~= nil and value or ""
end

return VfxConfig
