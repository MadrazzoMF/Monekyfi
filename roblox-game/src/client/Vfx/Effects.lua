--[[
	Vfx.Effects
	Compõe as primitivas em efeitos com nome. O servidor pede um id, o cliente
	monta.

	Divisão de cor proposital: o **elemento** define movimento, textura e as
	curvas de cor das partículas; a **cor da fruta** tinge a geometria (núcleo,
	onda, raios, projétil). Assim duas frutas de fogo com cores diferentes
	continuam se movendo como fogo, e uma fruta nova ganha identidade só
	escolhendo cor e elemento.

	`quality` vem do VfxController: "full" ou "reduced". Em "reduced" só saem
	geometria e luz — nada de partícula, estilhaço ou raio.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local VfxConfig = require(Shared.Config.VfxConfig)

local Primitives = require(script.Parent.Primitives)
local CameraShake = require(script.Parent.CameraShake)

local Effects = {}

-- Raio de referência. Um golpe com este raio usa partículas em escala 1.
local BASE_RADIUS = 8

--[[
	Receitas de explosão. Cada uma é uma variação dos mesmos ingredientes —
	é o que mantém a linguagem visual do jogo coerente entre um soco e uma nova.

	scale/count  multiplicam tamanho e quantidade de partícula
	shake/fov    intensidade do tremor e abertura de FOV
	disc/shards/bolts  ligam os ingredientes (se o elemento os definir)
]]
local BLASTS = {
	meleeImpact = { scale = 0.55, count = 0.7, shake = 0.10, shakeTime = 0.15, fov = 0 },
	swordSlash = { scale = 0.7, count = 0.9, shake = 0.14, shakeTime = 0.16, fov = 0, bolts = true },
	projectileImpact = {
		scale = 1,
		count = 1,
		shake = 0.32,
		shakeTime = 0.28,
		fov = 2,
		disc = true,
		shards = true,
		bolts = true,
	},
	areaBlast = {
		scale = 1.1,
		count = 1.2,
		shake = 0.45,
		shakeTime = 0.35,
		fov = 3,
		disc = true,
		shards = true,
		bolts = true,
	},
	nova = {
		scale = 1.3,
		count = 1.5,
		shake = 0.7,
		shakeTime = 0.5,
		fov = 5,
		disc = true,
		shards = true,
		bolts = true,
	},
	death = { scale = 0.9, count = 1, shake = 0.15, shakeTime = 0.22, fov = 0, disc = true, shards = true },
	-- Dano recebido: tremor forte de propósito, partícula fraca. O jogador
	-- precisa *sentir* que levou, não ver confete.
	npcHit = { scale = 0.5, count = 0.6, shake = 0.3, shakeTime = 0.22, fov = 0 },
	fruitEaten = { scale = 1, count = 1.3, shake = 0.2, shakeTime = 0.3, fov = 2, disc = true, bolts = true },
}

local function particleScale(radius, blast)
	return math.clamp(radius / BASE_RADIUS, 0.5, 3) * blast.scale
end

local function runBlast(payload, quality, element, color, blast)
	local position = payload.position
	local radius = payload.radius or BASE_RADIUS
	local full = quality == "full"

	Primitives.light(position, color, element.light)
	Primitives.core(position, color, radius, element.core)

	if blast.disc then
		Primitives.disc(position, color, radius, element.disc)
	end

	if full then
		Primitives.emit(position, element, particleScale(radius, blast), blast.count)

		if blast.shards then
			Primitives.shards(position, color, radius, element.shards)
		end
		if blast.bolts then
			Primitives.bolts(position, color, radius, element.bolts)
		end
	end

	if payload.target then
		Primitives.highlight(payload.target, element.accent, 0.18)
	end

	local shakeStrength = full and blast.shake or blast.shake * 0.5
	CameraShake.addAt(position, shakeStrength, blast.shakeTime)

	if blast.fov > 0 and full then
		CameraShake.punchFov(blast.fov, blast.shakeTime * 1.4)
	end
end

-- Efeitos com formato próprio -------------------------------------------------

local SPECIAL = {}

-- Tiro: fogacho na arma, traçado, impacto no destino.
function SPECIAL.gunshot(payload, quality, element, color)
	local origin = payload.origin or payload.position
	local target = payload.position

	Primitives.tracer(origin, target, element.accent, 0.28, 0.14)
	Primitives.light(origin, color, element.light)

	if quality == "full" then
		Primitives.emit(origin, element, 0.8, 1)
		Primitives.emit(target, VfxConfig.element("Physical"), 0.6, 0.8)
	end

	if payload.target then
		Primitives.highlight(payload.target, element.accent, 0.16)
	end

	CameraShake.addAt(origin, 0.18, 0.14)
end

-- Cone (lança-chamas): elipsoide alongado + partículas em três pontos do eixo,
-- para o volume não ficar só na ponta.
function SPECIAL.cone(payload, quality, element, color)
	local origin = payload.origin or payload.position
	local direction = payload.direction
	if not direction or direction.Magnitude < 0.01 then
		return
	end
	direction = direction.Unit

	local length = payload.length or 30
	local width = payload.width or (length * 0.45)

	Primitives.ellipsoid(origin, direction, color, width, length, element.core)
	Primitives.light(origin + direction * (length * 0.3), color, element.light)

	if quality == "full" then
		for _, fraction in ipairs({ 0.25, 0.6, 0.95 }) do
			Primitives.emit(
				origin + direction * (length * fraction),
				element,
				particleScale(width * 0.5, BLASTS.areaBlast),
				0.5
			)
		end
	end

	if payload.target then
		Primitives.highlight(payload.target, element.accent, 0.2)
	end

	CameraShake.addAt(origin, 0.3, 0.45)
	CameraShake.punchFov(2, 0.5)
end

-- Coluna de luz ao subir de nível. Sem tremor: é recompensa, não impacto.
function SPECIAL.levelUp(payload, quality)
	local position = payload.position
	local gold = Color3.fromRGB(255, 215, 110)
	local element = VfxConfig.element("Light")

	Primitives.light(position + Vector3.new(0, 3, 0), gold, {
		brightness = 8,
		range = 40,
		duration = 1.2,
	})

	Primitives.disc(position, gold, 10, { duration = 0.9, thickness = 0.3 })

	if quality == "full" then
		-- Partículas subindo em três alturas viram uma coluna.
		for _, height in ipairs({ 0, 4, 8 }) do
			Primitives.emit(position + Vector3.new(0, height, 0), element, 0.9, 0.6)
		end
	end

	CameraShake.punchFov(3, 0.7)
end

-- Só o flash no alvo, sem nada em volta.
function SPECIAL.hitFlash(payload, _, element)
	if payload.target then
		Primitives.highlight(payload.target, element.accent, 0.16)
	end
end

-- Entrada pública ------------------------------------------------------------

function Effects.play(payload, quality)
	local element = VfxConfig.element(payload.element)
	local color = payload.color or element.color

	local special = SPECIAL[payload.id]
	if special then
		special(payload, quality, element, color)
		return
	end

	local blast = BLASTS[payload.id]
	if blast then
		runBlast(payload, quality, element, color, blast)
		return
	end

	warn(string.format("[Vfx] efeito desconhecido: %s", tostring(payload.id)))
end

--[[
	Veste um projétil que o servidor já criou e move.

	A part chega invisível e replicada. Mudar as propriedades dela aqui só
	afeta este cliente — o servidor nunca reescreve cor ou tamanho, apenas
	CFrame — então o visual é 100% local e o acerto continua 100% do servidor.
]]
function Effects.attachProjectile(part, elementId, color, radius)
	local element = VfxConfig.element(elementId)
	color = color or element.color
	radius = radius or 6

	part.Shape = Enum.PartType.Ball
	part.Size = Vector3.new(1, 1, 1) * math.max(1.2, radius * 0.6)
	part.Material = Enum.Material.Neon
	part.Color = color
	part.Transparency = 0.15
	part.CastShadow = false

	local light = Instance.new("PointLight")
	light.Color = color
	light.Brightness = 4
	light.Range = 20
	light.Shadows = false
	light.Parent = part

	-- Rastro: o item mais barato que mais melhora a leitura de um projétil.
	local top = Instance.new("Attachment")
	top.Name = "TrailTop"
	top.Position = Vector3.new(0, part.Size.Y * 0.4, 0)
	top.Parent = part

	local bottom = Instance.new("Attachment")
	bottom.Name = "TrailBottom"
	bottom.Position = Vector3.new(0, -part.Size.Y * 0.4, 0)
	bottom.Parent = part

	local trail = Instance.new("Trail")
	trail.Attachment0 = top
	trail.Attachment1 = bottom
	trail.Lifetime = 0.32
	trail.MinLength = 0.05
	trail.LightEmission = 1
	trail.LightInfluence = 0
	trail.FaceCamera = true
	trail.Color = Primitives.colorSeq({ { 0, element.accent }, { 1, color } })
	trail.Transparency = Primitives.numberSeq({ { 0, 0.25 }, { 1, 1 } })
	trail.Parent = part

	Primitives.attachEmitters(part, element, 0.7, 0.45)
end

-- Aura discreta nas frutas caídas no mapa, para serem vistas de longe.
function Effects.attachFruitAura(part, elementId, color)
	local element = VfxConfig.element(elementId)
	Primitives.attachEmitters(part, element, 0.55, 0.2)

	local light = part:FindFirstChildOfClass("PointLight")
	if light then
		light.Color = color or element.color
	end
end

return Effects
