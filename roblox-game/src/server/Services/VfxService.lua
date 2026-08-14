--[[
	VfxService
	A ponta do servidor no sistema de efeitos: ele só *pede* efeitos, nunca
	cria parts visuais. Todo o custo de renderização fica no cliente.

	O filtro de distância aqui é importante: o cliente já descarta efeitos
	longe, mas descartar depois de receber o pacote não economiza rede. Com 20
	jogadores espalhados por 5 ilhas, mandar todo M1 para todo mundo seria
	desperdício puro.
]]

local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local VfxConfig = require(Shared.Config.VfxConfig)
local Net = require(Shared.Net)

local VfxService = {}

-- Margem sobre o corte do cliente: a câmera fica atrás do personagem, então o
-- limite real de visão é um pouco maior que a posição dele.
local BROADCAST_RANGE = VfxConfig.CullDistance + 60

local remote = nil

--[[
	payload = {
		id        string    (obrigatório)
		position  Vector3   (obrigatório — é o que decide quem recebe)
		element   string?
		color     Color3?
		radius    number?
		origin    Vector3?  (tiro, cone)
		direction Vector3?  (cone)
		length    number?   (cone)
		width     number?   (cone)
		target    Instance? (modelo que pisca ao ser atingido)
	}
]]
function VfxService.play(payload)
	if not remote or typeof(payload.position) ~= "Vector3" then
		return
	end

	for _, player in ipairs(Players:GetPlayers()) do
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart")

		if root and (root.Position - payload.position).Magnitude <= BROADCAST_RANGE then
			remote:FireClient(player, payload)
		end
	end
end

-- Para efeitos que só importam a um jogador (subir de nível, comer fruta).
function VfxService.playFor(player, payload)
	if remote and player.Parent then
		remote:FireClient(player, payload)
	end
end

--[[
	Marca uma part já criada pelo servidor para o cliente vesti-la.

	Chame ANTES de dar Parent na part: atributos e tags definidos antes do
	parent chegam ao cliente no mesmo pacote que a part, então o handler do
	cliente nunca lê um atributo vazio.
]]
function VfxService.tagProjectile(part, elementId, color, radius)
	part:SetAttribute("Element", elementId or VfxConfig.DefaultElement)
	part:SetAttribute("Color", color or Color3.new(1, 1, 1))
	part:SetAttribute("Radius", radius or 6)
	CollectionService:AddTag(part, "Vfx_Projectile")
end

function VfxService.tagFruit(part, elementId, color)
	part:SetAttribute("Element", elementId or VfxConfig.DefaultElement)
	part:SetAttribute("Color", color or Color3.new(1, 1, 1))
	CollectionService:AddTag(part, "Vfx_Fruit")
end

function VfxService.start()
	remote = Net.event("PlayVfx")
end

return VfxService
