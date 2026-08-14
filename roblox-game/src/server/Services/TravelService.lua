--[[
	TravelService
	Os cais gerados pelo MapBuilder. Substituem os barcos: sem eles as ilhas
	seriam inalcançáveis, já que ficam a centenas de studs de distância.

	O nível recomendado da ilha é exigido de verdade aqui — é o que impede um
	jogador nível 1 de ir farmar na Fortaleza da Marinha.
]]

local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local ZoneConfig = require(Shared.Config.ZoneConfig)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)

local TravelService = {}

local function travel(player, destinationId)
	local data = DataService.get(player)
	local zone = ZoneConfig.ById[destinationId]
	if not data or not zone then
		return
	end

	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if not character or not humanoid or humanoid.Health <= 0 then
		return
	end

	if data.level < zone.levelRec then
		Net.event("Notify"):FireClient(
			player,
			string.format("%s exige nível %d.", zone.name, zone.levelRec),
			"error"
		)
		return
	end

	local angle = math.random() * math.pi * 2
	local offset = Vector3.new(math.cos(angle) * 30, 6, math.sin(angle) * 30)
	character:PivotTo(CFrame.new(zone.center + offset))

	Net.event("Notify"):FireClient(player, string.format("Você chegou em %s.", zone.name), "success")
end

function TravelService.start()
	local function hookPad(pad)
		local destinationId = pad:GetAttribute("DestinationZone")
		local prompt = pad:FindFirstChildWhichIsA("ProximityPrompt", true)
		if not destinationId or not prompt then
			return
		end

		prompt.Triggered:Connect(function(player)
			travel(player, destinationId)
		end)
	end

	for _, pad in ipairs(CollectionService:GetTagged("TravelPad")) do
		hookPad(pad)
	end
	CollectionService:GetInstanceAddedSignal("TravelPad"):Connect(hookPad)
end

return TravelService
