--[[
	Vfx.Primitives
	Os tijolos de que todo efeito é feito. Tudo criado no cliente, dentro de uma
	pasta própria em Workspace — nada disso existe no servidor nem gera tráfego.

	Cada primitiva se limpa sozinha via Debris. Nenhuma delas devolve algo que
	precise ser destruído à mão, exceto `attachEmitters` (que acompanha uma
	part de vida própria) e `highlight` (que respeita um teto).
]]

local Debris = game:GetService("Debris")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local VfxConfig = require(Shared.Config.VfxConfig)

local Primitives = {}

local UPRIGHT_CYLINDER = CFrame.fromEulerAnglesXYZ(0, 0, math.pi / 2)
local random = Random.new()

local folder = nil
local activeHighlights = 0

function Primitives.folder()
	if folder and folder.Parent then
		return folder
	end

	local existing = Workspace:FindFirstChild("ClientVfx")
	if not existing then
		existing = Instance.new("Folder")
		existing.Name = "ClientVfx"
		existing.Parent = Workspace
	end

	folder = existing
	return folder
end

-- Sequências -----------------------------------------------------------------

function Primitives.numberSeq(points, multiplier)
	multiplier = multiplier or 1

	local keypoints = {}
	for _, point in ipairs(points) do
		table.insert(keypoints, NumberSequenceKeypoint.new(point[1], point[2] * multiplier))
	end
	return NumberSequence.new(keypoints)
end

function Primitives.colorSeq(points, fallback)
	if not points then
		return ColorSequence.new(fallback or Color3.new(1, 1, 1))
	end

	local keypoints = {}
	for _, point in ipairs(points) do
		table.insert(keypoints, ColorSequenceKeypoint.new(point[1], point[2]))
	end
	return ColorSequence.new(keypoints)
end

-- Base -----------------------------------------------------------------------

local function newVfxPart(props, lifetime)
	local part = Instance.new("Part")
	part.Anchored = true
	part.CanCollide = false
	part.CanQuery = false
	part.CanTouch = false
	part.CastShadow = false
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth

	for key, value in pairs(props) do
		part[key] = value
	end

	part.Parent = Primitives.folder()
	Debris:AddItem(part, lifetime)
	return part
end

function Primitives.anchor(position, lifetime)
	return newVfxPart({
		Name = "Anchor",
		Size = Vector3.new(0.2, 0.2, 0.2),
		Transparency = 1,
		CFrame = CFrame.new(position),
	}, lifetime)
end

-- Corpos ---------------------------------------------------------------------

function Primitives.light(position, color, spec)
	if not spec then
		return
	end

	local anchor = Primitives.anchor(position, spec.duration + 0.05)

	local light = Instance.new("PointLight")
	light.Color = color
	light.Brightness = spec.brightness
	light.Range = spec.range
	light.Shadows = false
	light.Parent = anchor

	-- O flash tem que morrer rápido, senão parece uma lâmpada acesa.
	TweenService:Create(light, TweenInfo.new(spec.duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Brightness = 0,
	}):Play()
end

-- Esfera que cresce e desaparece: o "estouro" central de qualquer impacto.
function Primitives.core(position, color, radius, spec)
	if not spec then
		return
	end

	local part = newVfxPart({
		Name = "Core",
		Shape = Enum.PartType.Ball,
		Material = spec.material,
		Color = color,
		Transparency = spec.transparency,
		Size = Vector3.new(1, 1, 1) * math.max(0.6, radius * 0.35),
		CFrame = CFrame.new(position),
	}, spec.duration + 0.1)

	TweenService:Create(part, TweenInfo.new(spec.duration, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), {
		Size = Vector3.new(1, 1, 1) * radius * 2 * spec.growth,
		Transparency = 1,
	}):Play()

	return part
end

-- Elipsoide alongado na direção do golpe. É o que faz o cone (lança-chamas)
-- sem precisar de um mesh de cone.
function Primitives.ellipsoid(origin, direction, color, width, length, spec)
	if not spec then
		return
	end

	local part = newVfxPart({
		Name = "Cone",
		Shape = Enum.PartType.Ball,
		Material = spec.material,
		Color = color,
		Transparency = spec.transparency,
		Size = Vector3.new(width * 0.3, width * 0.3, length * 0.3),
		CFrame = CFrame.lookAt(origin + direction * (length * 0.15), origin + direction * length),
	}, spec.duration + 0.15)

	TweenService:Create(part, TweenInfo.new(spec.duration * 1.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Size = Vector3.new(width, width, length),
		CFrame = CFrame.lookAt(origin + direction * (length * 0.5), origin + direction * length),
		Transparency = 1,
	}):Play()
end

-- Onda circular no chão. Encontra o chão por raycast; se não achar (golpe no
-- ar), não desenha nada, porque uma onda flutuando parece defeito.
function Primitives.disc(position, color, radius, spec)
	if not spec then
		return
	end

	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	params.FilterDescendantsInstances = { Primitives.folder() }

	local result = Workspace:Raycast(position + Vector3.new(0, 4, 0), Vector3.new(0, -26, 0), params)
	if not result then
		return
	end

	local part = newVfxPart({
		Name = "Disc",
		Shape = Enum.PartType.Cylinder,
		Material = Enum.Material.Neon,
		Color = color,
		Transparency = 0.35,
		Size = Vector3.new(spec.thickness, radius * 0.5, radius * 0.5),
		CFrame = CFrame.new(result.Position + Vector3.new(0, 0.15, 0)) * UPRIGHT_CYLINDER,
	}, spec.duration + 0.1)

	TweenService:Create(part, TweenInfo.new(spec.duration, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), {
		Size = Vector3.new(spec.thickness, radius * 2.6, radius * 2.6),
		Transparency = 1,
	}):Play()
end

-- Partículas -----------------------------------------------------------------

local function configureEmitter(emitter, layer, scale)
	emitter.Texture = VfxConfig.texture(layer.texture)
	emitter.Lifetime = NumberRange.new(layer.lifetime[1], layer.lifetime[2])
	emitter.Speed = NumberRange.new(layer.speed[1] * scale, layer.speed[2] * scale)
	emitter.SpreadAngle = Vector2.new(layer.spread, layer.spread)
	emitter.Size = Primitives.numberSeq(layer.size, scale)
	emitter.Transparency = Primitives.numberSeq(layer.alpha)
	emitter.Color = Primitives.colorSeq(layer.colors)
	emitter.Acceleration = layer.accel or Vector3.new()
	emitter.Drag = layer.drag or 0
	emitter.LightEmission = layer.lightEmission or 0
	emitter.LightInfluence = 0
	emitter.Rotation = NumberRange.new(0, 360)
	emitter.RotSpeed = NumberRange.new(layer.rotSpeed[1], layer.rotSpeed[2])
	emitter.Squash = NumberSequence.new(layer.squash or 0)
	-- Sem isto, partículas grandes atravessam paredes e a própria geometria do
	-- efeito de forma feia.
	emitter.ZOffset = 0.2
	emitter.VelocityInheritance = 0
end

--[[
	Explosão de partículas de uso único.
	`scale` multiplica tamanho e velocidade — golpes maiores têm partículas
	proporcionalmente maiores, senão uma nova de 30 studs parece uma faísca.
]]
function Primitives.emit(position, element, scale, countMultiplier)
	if not element.layers then
		return
	end

	scale = scale or 1
	countMultiplier = countMultiplier or 1

	local longest = 0
	for _, layer in ipairs(element.layers) do
		longest = math.max(longest, layer.lifetime[2])
	end

	local anchor = Primitives.anchor(position, longest + 0.2)

	for _, layer in ipairs(element.layers) do
		local emitter = Instance.new("ParticleEmitter")
		emitter.Enabled = false
		configureEmitter(emitter, layer, scale)
		emitter.Parent = anchor
		emitter:Emit(math.max(1, math.floor(layer.count * countMultiplier)))
	end
end

-- Emissores contínuos grudados numa part que se move (projétil, aura de fruta).
-- Quem chamou é responsável por destruir junto com a part.
function Primitives.attachEmitters(part, element, scale, rateMultiplier)
	if not element.layers then
		return
	end

	scale = scale or 1
	rateMultiplier = rateMultiplier or 1

	for _, layer in ipairs(element.layers) do
		local emitter = Instance.new("ParticleEmitter")
		configureEmitter(emitter, layer, scale)
		emitter.Rate = math.max(2, layer.count * 2.5 * rateMultiplier)
		-- Herança de velocidade dá a sensação de rastro em vez de nuvem parada.
		emitter.VelocityInheritance = 0.35
		emitter.Parent = part
	end
end

-- Estilhaços -----------------------------------------------------------------

-- Pedaços sólidos com física local. CanCollide fica desligado para não
-- empurrar jogadores, mas a gravidade continua agindo — é o que faz o gelo
-- parecer gelo e a areia parecer entulho.
function Primitives.shards(position, color, radius, spec)
	if not spec then
		return
	end

	for _ = 1, spec.count do
		local direction = Vector3.new(
			random:NextNumber(-1, 1),
			random:NextNumber(0.2, 1),
			random:NextNumber(-1, 1)
		)
		if direction.Magnitude < 0.05 then
			direction = Vector3.new(0, 1, 0)
		end
		direction = direction.Unit

		local part = newVfxPart({
			Name = "Shard",
			Anchored = false,
			Material = Enum.Material.Glass,
			Color = color,
			Transparency = 0.15,
			Size = spec.size * random:NextNumber(0.7, 1.4),
			CFrame = CFrame.new(position + direction * radius * 0.3) * CFrame.fromEulerAnglesXYZ(
				random:NextNumber(0, 6.28),
				random:NextNumber(0, 6.28),
				random:NextNumber(0, 6.28)
			),
		}, spec.duration + 0.2)

		part.AssemblyLinearVelocity = direction * spec.speed * random:NextNumber(0.7, 1.3)
		part.AssemblyAngularVelocity = Vector3.new(
			random:NextNumber(-spec.spin, spec.spin),
			random:NextNumber(-spec.spin, spec.spin),
			random:NextNumber(-spec.spin, spec.spin)
		)

		TweenService:Create(part, TweenInfo.new(spec.duration, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
			Transparency = 1,
		}):Play()
	end
end

-- Raios ----------------------------------------------------------------------

local function drawBolt(origin, target, color, width, duration, segments, jitter)
	local total = target - origin
	local length = total.Magnitude
	if length < 0.5 then
		return
	end

	local previous = origin
	for index = 1, segments do
		local isLast = index == segments
		local along = origin + total * (index / segments)

		local finish = along
		if not isLast then
			-- Desvio lateral cresce com o comprimento do raio.
			finish = along
				+ Vector3.new(
					random:NextNumber(-1, 1),
					random:NextNumber(-1, 1),
					random:NextNumber(-1, 1)
				) * length * jitter
		end

		local segment = finish - previous
		if segment.Magnitude > 0.1 then
			local part = newVfxPart({
				Name = "Bolt",
				Material = Enum.Material.Neon,
				Color = color,
				Transparency = 0.05,
				Size = Vector3.new(width, width, segment.Magnitude),
				CFrame = CFrame.lookAt(previous + segment / 2, finish),
			}, duration + 0.05)

			TweenService:Create(part, TweenInfo.new(duration, Enum.EasingStyle.Linear), {
				Transparency = 1,
			}):Play()
		end

		previous = finish
	end
end

-- Raios saindo do centro em direções aleatórias.
function Primitives.bolts(position, color, radius, spec)
	if not spec then
		return
	end

	for _ = 1, spec.count do
		local direction = Vector3.new(
			random:NextNumber(-1, 1),
			random:NextNumber(-0.3, 1),
			random:NextNumber(-1, 1)
		)
		if direction.Magnitude < 0.05 then
			direction = Vector3.new(0, 1, 0)
		end

		local target = position + direction.Unit * radius * random:NextNumber(0.7, 1.15)
		drawBolt(position, target, color, spec.width, spec.duration, spec.segments, spec.jitter)
	end
end

-- Raio dirigido entre dois pontos (tiro, arco de raio até o alvo).
function Primitives.boltTo(origin, target, color, spec)
	if not spec then
		return
	end
	drawBolt(origin, target, color, spec.width, spec.duration, spec.segments, spec.jitter)
end

-- Traçado reto e fino: bala.
function Primitives.tracer(origin, target, color, width, duration)
	local offset = target - origin
	if offset.Magnitude < 0.5 then
		return
	end

	local part = newVfxPart({
		Name = "Tracer",
		Material = Enum.Material.Neon,
		Color = color,
		Transparency = 0.1,
		Size = Vector3.new(width, width, offset.Magnitude),
		CFrame = CFrame.lookAt(origin + offset / 2, target),
	}, duration + 0.05)

	TweenService:Create(part, TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Transparency = 1,
		Size = Vector3.new(width * 0.2, width * 0.2, offset.Magnitude),
	}):Play()
end

-- Flash no alvo --------------------------------------------------------------

-- O feedback mais importante do combate: o corpo atingido pisca. O teto existe
-- porque o Roblox degrada acima de ~31 Highlights simultâneos.
function Primitives.highlight(model, color, duration)
	if not model or not model.Parent or activeHighlights >= VfxConfig.MaxHighlights then
		return
	end

	activeHighlights += 1

	local highlight = Instance.new("Highlight")
	highlight.Adornee = model
	highlight.FillColor = color
	highlight.FillTransparency = 0.45
	highlight.OutlineColor = Color3.new(1, 1, 1)
	highlight.OutlineTransparency = 0.2
	highlight.DepthMode = Enum.HighlightDepthMode.Occluded
	highlight.Parent = Primitives.folder()

	TweenService:Create(highlight, TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		FillTransparency = 1,
		OutlineTransparency = 1,
	}):Play()

	task.delay(duration + 0.05, function()
		highlight:Destroy()
		activeHighlights -= 1
	end)
end

return Primitives
