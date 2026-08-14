--[[
	CombatController
	Traduz input em pedidos para o servidor. Nada aqui decide dano: o cliente
	só informa "quero atacar apontando para este ponto".

	O throttle local existe para não inundar o remote — o servidor tem o seu
	próprio cooldown, que é o que realmente vale.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local FruitConfig = require(Shared.Config.FruitConfig)
local WeaponConfig = require(Shared.Config.WeaponConfig)
local Net = require(Shared.Net)

local ClientState = require(script.Parent.Parent.ClientState)

local CombatController = {}

local player = Players.LocalPlayer
local mouse = player:GetMouse()

local MOVE_KEYS = {
	[Enum.KeyCode.Z] = "Z",
	[Enum.KeyCode.X] = "X",
	[Enum.KeyCode.C] = "C",
}

local nextM1 = 0
local nextMove = {}
local holdingAttack = false

local function aimPosition()
	local hit = mouse.Hit
	if hit then
		return hit.Position
	end

	-- Sem alvo sob o cursor: mira num ponto distante na direção da câmera.
	local ray = mouse.UnitRay
	return ray.Origin + ray.Direction * 200
end

local function isAlive()
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	return humanoid ~= nil and humanoid.Health > 0
end

local function tryM1()
	if not isAlive() or os.clock() < nextM1 then
		return
	end

	local data = ClientState.data
	local weapon = data and WeaponConfig.get(data.equipped) or WeaponConfig.get(WeaponConfig.Default)
	nextM1 = os.clock() + weapon.cooldown

	Net.event("M1"):FireServer(aimPosition())
end

local function tryMove(moveKey)
	if not isAlive() then
		return
	end

	local data = ClientState.data
	if not data or not data.fruit then
		return
	end

	local move = FruitConfig.getMove(data.fruit, moveKey)
	if not move then
		return
	end

	if os.clock() < (nextMove[moveKey] or 0) then
		return
	end
	nextMove[moveKey] = os.clock() + move.cooldown

	Net.event("UseMove"):FireServer(moveKey, aimPosition())
end

function CombatController.start()
	UserInputService.InputBegan:Connect(function(input, processedByGui)
		if processedByGui then
			return
		end

		if
			input.UserInputType == Enum.UserInputType.MouseButton1
			or input.UserInputType == Enum.UserInputType.Touch
		then
			holdingAttack = true
			tryM1()
		elseif input.UserInputType == Enum.UserInputType.Keyboard then
			local moveKey = MOVE_KEYS[input.KeyCode]
			if moveKey then
				tryMove(moveKey)
			end
		end
	end)

	UserInputService.InputEnded:Connect(function(input)
		if
			input.UserInputType == Enum.UserInputType.MouseButton1
			or input.UserInputType == Enum.UserInputType.Touch
		then
			holdingAttack = false
		end
	end)

	-- Segurar o clique mantém o combo saindo, como nos jogos do gênero.
	RunService.Heartbeat:Connect(function()
		if holdingAttack then
			tryM1()
		end
	end)

	-- Se o servidor recusar (cooldown real diferente do estimado), ele devolve
	-- o cooldown verdadeiro e o cliente se alinha.
	Net.event("MoveResult").OnClientEvent:Connect(function(key, cooldown)
		if key == "M1" then
			nextM1 = os.clock() + cooldown
		else
			nextMove[key] = os.clock() + cooldown
		end
	end)
end

return CombatController
