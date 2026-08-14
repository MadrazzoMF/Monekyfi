--[[
	Net
	Registro único dos remotes. O servidor cria a pasta ReplicatedStorage/Remotes
	no boot; o cliente só espera por ela. Manter a lista aqui evita
	Instance.new("RemoteEvent") espalhado pelo código e torna óbvio qual é a
	superfície de rede do jogo.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Net = {}

-- Servidor -> cliente
Net.Events = {
	"State", -- snapshot completo do perfil do jogador
	"Notify", -- toast de texto
	"Damage", -- número de dano flutuante
	"MoveResult", -- confirmação de golpe: inicia o cooldown no HUD
	"QuestOffer", -- abre o quadro de missões de um NPC

	-- cliente -> servidor
	"M1",
	"UseMove",
	"AllocateStat",
	"ResetStats",
	"AcceptQuest",
	"AbandonQuest",
	"BuyWeapon",
	"EquipWeapon",
}

Net.Functions = {
	"GetState", -- busca inicial, evita corrida entre HUD e primeiro State
}

local folder = nil

local function ensureFolder()
	if folder and folder.Parent then
		return folder
	end
	folder = ReplicatedStorage:WaitForChild("Remotes", 30)
	assert(folder, "Net: pasta Remotes não apareceu. O servidor iniciou?")
	return folder
end

-- Chamado uma vez pelo bootstrap do servidor, antes de qualquer service.
function Net.initServer()
	local newFolder = Instance.new("Folder")
	newFolder.Name = "Remotes"

	for _, name in ipairs(Net.Events) do
		local remote = Instance.new("RemoteEvent")
		remote.Name = name
		remote.Parent = newFolder
	end

	for _, name in ipairs(Net.Functions) do
		local remote = Instance.new("RemoteFunction")
		remote.Name = name
		remote.Parent = newFolder
	end

	newFolder.Parent = ReplicatedStorage
	folder = newFolder
	return newFolder
end

function Net.event(name)
	local remote = ensureFolder():WaitForChild(name, 10)
	assert(remote, string.format("Net: RemoteEvent '%s' não existe", name))
	return remote
end

function Net.func(name)
	local remote = ensureFolder():WaitForChild(name, 10)
	assert(remote, string.format("Net: RemoteFunction '%s' não existe", name))
	return remote
end

return Net
