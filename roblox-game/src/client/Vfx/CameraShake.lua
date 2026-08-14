--[[
	Vfx.CameraShake
	Tremor de câmera e punch de FOV. É o que faz um golpe pesado *parecer*
	pesado — mais do que qualquer partícula.

	Roda depois do script de câmera padrão (RenderPriority.Camera + 1), senão o
	Roblox sobrescreveria o CFrame no mesmo frame e nada apareceria.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local VfxConfig = require(Shared.Config.VfxConfig)

local CameraShake = {}

local BIND_NAME = "VfxCameraShake"
local FREQUENCY = 14

local shakes = {}
local punches = {}
local baseFov = nil
local bound = false
local seedCounter = 0

--[[
	Adiciona um tremor.
	strength: 0..1 (1 = tremor máximo definido em VfxConfig.Shake)
]]
function CameraShake.add(strength, duration)
	if strength <= 0.01 then
		return
	end

	seedCounter += 1
	table.insert(shakes, {
		strength = math.clamp(strength, 0, 1),
		duration = math.max(0.05, duration),
		start = os.clock(),
		seed = seedCounter * 37.5,
	})
end

-- Tremor com queda por distância: uma explosão longe sacode de leve, e uma
-- na sua cara sacode tudo.
function CameraShake.addAt(position, strength, duration)
	local camera = Workspace.CurrentCamera
	if not camera then
		return
	end

	local distance = (camera.CFrame.Position - position).Magnitude
	local falloff = VfxConfig.Shake.falloff
	local factor = 1 / (1 + (distance / falloff) ^ 2)

	CameraShake.add(strength * factor, duration)
end

-- Abertura rápida do campo de visão. Amount em graus.
function CameraShake.punchFov(amount, duration)
	if amount <= 0.05 then
		return
	end

	table.insert(punches, {
		amount = amount,
		duration = math.max(0.05, duration),
		start = os.clock(),
	})
end

local function update()
	local camera = Workspace.CurrentCamera
	if not camera then
		return
	end

	if not baseFov then
		baseFov = camera.FieldOfView
	end

	local now = os.clock()
	local offsetX, offsetY, roll = 0, 0, 0

	for index = #shakes, 1, -1 do
		local shake = shakes[index]
		local elapsed = now - shake.start

		if elapsed >= shake.duration then
			table.remove(shakes, index)
		else
			-- Decai ao quadrado: o pico é no impacto e some rápido.
			local decay = (1 - elapsed / shake.duration) ^ 2
			-- math.noise devolve algo em torno de [-0.5, 0.5]; o ×2 leva a
			-- amplitude de volta para [-1, 1], que é a escala que maxOffset
			-- e maxRoll esperam.
			local amplitude = shake.strength * decay * 2
			local time = elapsed * FREQUENCY

			offsetX += math.noise(time, shake.seed) * amplitude
			offsetY += math.noise(time, shake.seed + 11.3) * amplitude
			roll += math.noise(time, shake.seed + 23.7) * amplitude
		end
	end

	local fovOffset = 0
	for index = #punches, 1, -1 do
		local punch = punches[index]
		local elapsed = now - punch.start

		if elapsed >= punch.duration then
			table.remove(punches, index)
		else
			-- Sobe em 20% do tempo, volta nos 80% restantes.
			local progress = elapsed / punch.duration
			local shape = progress < 0.2 and (progress / 0.2) or (1 - (progress - 0.2) / 0.8)
			fovOffset += punch.amount * shape
		end
	end

	camera.FieldOfView = baseFov + fovOffset

	if offsetX == 0 and offsetY == 0 and roll == 0 then
		return
	end

	local maxOffset = VfxConfig.Shake.maxOffset
	local maxRoll = VfxConfig.Shake.maxRoll

	camera.CFrame = camera.CFrame
		* CFrame.new(
			math.clamp(offsetX, -1, 1) * maxOffset,
			math.clamp(offsetY, -1, 1) * maxOffset,
			0
		)
		* CFrame.Angles(0, 0, math.clamp(roll, -1, 1) * maxRoll)
end

function CameraShake.start()
	if bound then
		return
	end
	bound = true

	RunService:BindToRenderStep(BIND_NAME, Enum.RenderPriority.Camera.Value + 1, update)
end

return CameraShake
