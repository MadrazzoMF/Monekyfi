--[[
	ClientState
	Cópia local do perfil do jogador. O servidor manda o snapshot inteiro pelo
	remote "State"; cada controller se inscreve em `changed` em vez de escutar
	o remote por conta própria.

	Isto é leitura para exibição, nunca autoridade: mudar `ClientState.data`
	não muda nada no servidor.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared.Net)
local Signal = require(Shared.Util.Signal)

local ClientState = {}

ClientState.data = nil
ClientState.changed = Signal.new() -- (data)

function ClientState.start()
	Net.event("State").OnClientEvent:Connect(function(data)
		ClientState.data = data
		ClientState.changed:Fire(data)
	end)

	-- Busca inicial: o State pode ter sido enviado antes de o cliente conectar
	-- o handler acima.
	task.spawn(function()
		local ok, data = pcall(function()
			return Net.func("GetState"):InvokeServer()
		end)

		if ok and data and not ClientState.data then
			ClientState.data = data
			ClientState.changed:Fire(data)
		end
	end)
end

return ClientState
