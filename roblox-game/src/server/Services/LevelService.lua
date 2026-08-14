--[[
	LevelService
	XP, nível, pontos de stat e Beli. Todo ganho de progressão do jogo passa
	por aqui, então é o único lugar onde a curva de XP é interpretada.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)
local StatConfig = require(Shared.Config.StatConfig)
local Net = require(Shared.Net)
local Signal = require(Shared.Util.Signal)

local DataService = require(script.Parent.DataService)
local VfxService = require(script.Parent.VfxService)

local LevelService = {}

-- Disparado quando algo que afeta o personagem muda (nível ou Defesa).
-- O CharacterService escuta para recalcular a vida máxima.
LevelService.statsChanged = Signal.new() -- (player)

local RESET_COST = 5000

local function notify(player, text, kind)
	Net.event("Notify"):FireClient(player, text, kind or "info")
end

function LevelService.addBeli(player, amount)
	local data = DataService.get(player)
	if not data or amount == 0 then
		return
	end

	data.beli = math.max(0, data.beli + amount)
	DataService.push(player)
end

function LevelService.addXp(player, amount)
	local data = DataService.get(player)
	if not data or amount <= 0 then
		return
	end

	if data.level >= GameConfig.MaxLevel then
		return
	end

	data.xp += math.floor(amount)

	local leveled = false
	-- while, não if: um boss pode dar XP suficiente para vários níveis.
	while data.level < GameConfig.MaxLevel do
		local needed = GameConfig.xpToNextLevel(data.level)
		if data.xp < needed then
			break
		end

		data.xp -= needed
		data.level += 1
		data.statPoints += GameConfig.StatPointsPerLevel
		leveled = true
	end

	if data.level >= GameConfig.MaxLevel then
		data.level = GameConfig.MaxLevel
		data.xp = 0
	end

	if leveled then
		notify(player, string.format("Nível %d! +%d pontos", data.level, GameConfig.StatPointsPerLevel), "success")
		LevelService.statsChanged:Fire(player)

		-- Só para quem subiu: uma coluna de luz na tela dos outros a cada abate
		-- alheio viraria poluição.
		local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
		if root then
			VfxService.playFor(player, {
				id = "levelUp",
				position = root.Position - Vector3.new(0, 2.5, 0),
			})
		end
	end

	DataService.push(player)
end

-- Handlers de remote ---------------------------------------------------------

local function onAllocateStat(player, statId, requested)
	local data = DataService.get(player)
	if not data then
		return
	end

	-- Tudo que vem do cliente é hostil até ser validado.
	if type(statId) ~= "string" or not StatConfig.isValid(statId) then
		return
	end

	local amount = tonumber(requested) or 1
	amount = math.floor(amount)
	if amount < 1 then
		return
	end

	amount = math.min(amount, data.statPoints)
	amount = math.min(amount, StatConfig.MaxPerStat - data.stats[statId])
	if amount < 1 then
		return
	end

	data.stats[statId] += amount
	data.statPoints -= amount

	if statId == "Defense" then
		LevelService.statsChanged:Fire(player)
	end

	DataService.push(player)
end

local function onResetStats(player)
	local data = DataService.get(player)
	if not data then
		return
	end

	if data.beli < RESET_COST then
		notify(player, string.format("Resetar stats custa %d Beli.", RESET_COST), "error")
		return
	end

	local refunded = 0
	for _, statId in ipairs(StatConfig.Order) do
		refunded += data.stats[statId]
		data.stats[statId] = 0
	end

	data.beli -= RESET_COST
	data.statPoints += refunded

	notify(player, string.format("%d pontos devolvidos.", refunded), "success")
	LevelService.statsChanged:Fire(player)
	DataService.push(player)
end

function LevelService.start()
	Net.event("AllocateStat").OnServerEvent:Connect(onAllocateStat)
	Net.event("ResetStats").OnServerEvent:Connect(onResetStats)
end

return LevelService
