--[[
	DataService
	Carrega, mantém em memória e salva o perfil de cada jogador.

	Regra de ouro: se o carregamento falhar, o perfil entra em modo
	"não salvar". É melhor o jogador perder uma sessão do que sobrescrever o
	save real com dados em branco.

	Para um jogo em produção com muitos jogadores, troque este módulo por
	ProfileStore (session locking de verdade). A interface pública aqui
	(get/push/profileLoaded) foi desenhada para essa troca ser localizada.
]]

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)
local StatConfig = require(Shared.Config.StatConfig)
local WeaponConfig = require(Shared.Config.WeaponConfig)
local Net = require(Shared.Net)
local Signal = require(Shared.Util.Signal)

local DataService = {}

DataService.profileLoaded = Signal.new() -- (player, data)
DataService.profileReleased = Signal.new() -- (player)

local store = nil
local profiles = {} -- [Player] = data
local locked = {} -- [Player] = true  -> carregou com erro, nunca salvar
local started = false

local function keyFor(player)
	return "Player_" .. tostring(player.UserId)
end

local function defaultData()
	return {
		schema = 1,
		level = 1,
		xp = 0,
		statPoints = 0,
		stats = StatConfig.blank(),
		beli = GameConfig.StartingBeli,
		fruit = nil, -- id da fruta comida, nil = sem poder
		weapons = { WeaponConfig.Default },
		equipped = WeaponConfig.Default,
		quest = nil, -- { id = string, progress = number }
		kills = 0,
		playtime = 0,
	}
end

-- Preenche campos que não existiam em saves antigos. Chamado em todo load,
-- então adicionar um campo novo em defaultData() é retrocompatível.
local function reconcile(data)
	local template = defaultData()

	for key, value in pairs(template) do
		if data[key] == nil then
			data[key] = value
		end
	end

	-- stats é aninhado, precisa de reconcile próprio.
	if type(data.stats) ~= "table" then
		data.stats = StatConfig.blank()
	else
		for _, statId in ipairs(StatConfig.Order) do
			if type(data.stats[statId]) ~= "number" then
				data.stats[statId] = 0
			end
		end
	end

	if type(data.weapons) ~= "table" or #data.weapons == 0 then
		data.weapons = { WeaponConfig.Default }
	end

	-- Arma equipada precisa estar no inventário e existir no config atual
	-- (uma arma removida do jogo não deve travar o M1).
	if not WeaponConfig.get(data.equipped) or not table.find(data.weapons, data.equipped) then
		data.equipped = WeaponConfig.Default
	end

	return data
end

local function loadAsync(player)
	if not store then
		return nil, "DataStore indisponível"
	end

	local lastError
	for attempt = 1, GameConfig.SaveRetries do
		local ok, result = pcall(function()
			return store:GetAsync(keyFor(player))
		end)

		if ok then
			return result, nil
		end

		lastError = result
		task.wait(2 ^ attempt) -- backoff: 2s, 4s, 8s, 16s
	end

	return nil, tostring(lastError)
end

local function saveAsync(player, data)
	if not store or locked[player] then
		return false
	end

	local lastError
	for attempt = 1, GameConfig.SaveRetries do
		local ok, err = pcall(function()
			store:SetAsync(keyFor(player), data)
		end)

		if ok then
			return true
		end

		lastError = err
		task.wait(2 ^ attempt)
	end

	warn(string.format("[DataService] falha ao salvar %s: %s", player.Name, tostring(lastError)))
	return false
end

-- API ------------------------------------------------------------------------

function DataService.get(player)
	return profiles[player]
end

-- Espera o perfil ficar disponível. Usar nos services que rodam em resposta a
-- CharacterAdded, que pode disparar antes do load terminar.
function DataService.waitFor(player, timeout)
	local deadline = os.clock() + (timeout or 20)
	while not profiles[player] and os.clock() < deadline do
		if not player.Parent then
			return nil
		end
		task.wait(0.1)
	end
	return profiles[player]
end

-- Envia o snapshot do perfil para o cliente. Chamar sempre que qualquer
-- número do perfil mudar — é a única forma do HUD saber.
function DataService.push(player)
	local data = profiles[player]
	if not data or not player.Parent then
		return
	end
	Net.event("State"):FireClient(player, data)
end

function DataService.saveNow(player)
	local data = profiles[player]
	if data then
		saveAsync(player, data)
	end
end

-- Ciclo de vida ---------------------------------------------------------------

local function onPlayerAdded(player)
	local raw, err = loadAsync(player)

	if err then
		locked[player] = true
		warn(string.format("[DataService] %s entrou em modo somente-leitura: %s", player.Name, err))
	end

	local data = reconcile(type(raw) == "table" and raw or defaultData())
	profiles[player] = data

	DataService.push(player)
	DataService.profileLoaded:Fire(player, data)

	if locked[player] then
		task.delay(3, function()
			if player.Parent then
				Net.event("Notify"):FireClient(
					player,
					"Não conseguimos carregar seu progresso. Nada será salvo nesta sessão.",
					"error"
				)
			end
		end)
	end
end

local function onPlayerRemoving(player)
	local data = profiles[player]
	DataService.profileReleased:Fire(player)

	if data then
		saveAsync(player, data)
	end

	profiles[player] = nil
	locked[player] = nil
end

function DataService.start()
	if started then
		return
	end
	started = true

	local ok, result = pcall(function()
		return DataStoreService:GetDataStore(GameConfig.DataStoreName)
	end)

	if ok then
		store = result
	else
		warn(
			"[DataService] DataStore inacessível. No Studio, ligue "
				.. "Game Settings > Security > Enable Studio Access to API Services. "
				.. "O jogo roda, mas nada será salvo."
		)
	end

	for _, player in ipairs(Players:GetPlayers()) do
		task.spawn(onPlayerAdded, player)
	end
	Players.PlayerAdded:Connect(function(player)
		task.spawn(onPlayerAdded, player)
	end)
	Players.PlayerRemoving:Connect(onPlayerRemoving)

	-- Autosave escalonado: cada jogador salva no seu próprio ciclo em vez de
	-- todos de uma vez, o que estouraria o limite de requisições do DataStore
	-- em servidores cheios.
	task.spawn(function()
		while true do
			task.wait(GameConfig.AutoSaveInterval)
			for _, player in ipairs(Players:GetPlayers()) do
				local data = profiles[player]
				if data then
					data.playtime += GameConfig.AutoSaveInterval
					task.spawn(saveAsync, player, data)
					task.wait(0.2)
				end
			end
		end
	end)

	-- Servidor desligando: salva todos antes do processo morrer.
	game:BindToClose(function()
		if RunService:IsStudio() then
			return
		end
		for player, data in pairs(profiles) do
			task.spawn(saveAsync, player, data)
		end
		task.wait(3)
	end)

	Net.func("GetState").OnServerInvoke = function(player)
		return DataService.waitFor(player, 15)
	end
end

return DataService
