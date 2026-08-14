--[[
	VfxController
	Porta de entrada dos efeitos no cliente.

	Duas responsabilidades além de repassar o pedido:

	1. **Orçamento.** Decide entre efeito completo, versão leve ou nada, por
	   distância da câmera e por quantos efeitos completos já estão no ar. Sem
	   isso, uma briga de 6 jogadores com novas de 30 studs derruba o FPS.

	2. **Vestir instâncias replicadas.** Projéteis e frutas são parts criadas
	   pelo servidor (que precisa delas para acerto e para o prompt). O visual
	   é adicionado aqui, localmente.
]]

local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local VfxConfig = require(Shared.Config.VfxConfig)
local Net = require(Shared.Net)

local Vfx = script.Parent.Parent.Vfx
local Effects = require(Vfx.Effects)
local CameraShake = require(Vfx.CameraShake)

local VfxController = {}

-- Quanto tempo um efeito completo conta para o orçamento. Não é a duração
-- real do efeito, é a janela em que ele custa frames.
local BUDGET_WINDOW = 0.6

local activeFull = 0

-- nil = não desenhar nada.
local function qualityFor(position)
	local camera = Workspace.CurrentCamera
	if not camera then
		return nil
	end

	local distance = (camera.CFrame.Position - position).Magnitude

	if distance > VfxConfig.CullDistance then
		return nil
	end
	if distance > VfxConfig.ReducedDistance then
		return "reduced"
	end
	if activeFull >= VfxConfig.MaxConcurrent then
		-- Estourou o orçamento: cai para leve em vez de sumir. Um golpe sem
		-- efeito nenhum parece bug; um golpe fraco só parece distante.
		return "reduced"
	end

	return "full"
end

local function onPlayVfx(payload)
	-- O payload vem do servidor, mas validar é barato e evita que um bug no
	-- servidor apareça como erro no cliente de todo mundo.
	if type(payload) ~= "table" or typeof(payload.position) ~= "Vector3" then
		return
	end

	local quality = qualityFor(payload.position)
	if not quality then
		return
	end

	if quality == "full" then
		activeFull += 1
		task.delay(BUDGET_WINDOW, function()
			activeFull -= 1
		end)
	end

	local ok, err = pcall(Effects.play, payload, quality)
	if not ok then
		warn(string.format("[Vfx] falha em '%s': %s", tostring(payload.id), tostring(err)))
	end
end

local function hookTag(tagName, handler)
	local function safeHandler(instance)
		if not instance:IsA("BasePart") then
			return
		end
		local ok, err = pcall(handler, instance)
		if not ok then
			warn(string.format("[Vfx] falha ao vestir %s: %s", tagName, tostring(err)))
		end
	end

	for _, instance in ipairs(CollectionService:GetTagged(tagName)) do
		safeHandler(instance)
	end
	CollectionService:GetInstanceAddedSignal(tagName):Connect(safeHandler)
end

function VfxController.start()
	CameraShake.start()

	Net.event("PlayVfx").OnClientEvent:Connect(onPlayVfx)

	hookTag("Vfx_Projectile", function(part)
		Effects.attachProjectile(
			part,
			part:GetAttribute("Element"),
			part:GetAttribute("Color"),
			part:GetAttribute("Radius")
		)
	end)

	hookTag("Vfx_Fruit", function(part)
		Effects.attachFruitAura(part, part:GetAttribute("Element"), part:GetAttribute("Color"))
	end)
end

return VfxController
