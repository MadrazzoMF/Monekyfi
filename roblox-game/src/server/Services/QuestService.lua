--[[
	QuestService
	Uma missão ativa por vez, como em Blox Fruits. O NPC de missão abre um
	quadro no cliente; o servidor valida nível e paga a recompensa.
]]

local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local QuestConfig = require(Shared.Config.QuestConfig)
local NpcConfig = require(Shared.Config.NpcConfig)
local ZoneConfig = require(Shared.Config.ZoneConfig)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)
local LevelService = require(script.Parent.LevelService)

local QuestService = {}

-- Índice giverId -> lista de questIds, montado a partir do ZoneConfig.
local giverQuests = {}
for _, zone in ipairs(ZoneConfig.Zones) do
	for _, giver in ipairs(zone.questGivers) do
		giverQuests[giver.id] = {
			name = giver.name,
			zoneId = zone.id,
			quests = giver.quests,
		}
	end
end

local function notify(player, text, kind)
	Net.event("Notify"):FireClient(player, text, kind or "info")
end

-- Monta a descrição que o cliente exibe. Feito no servidor para o cliente não
-- precisar reimplementar as regras de elegibilidade.
local function questPayload(quest, data)
	local target = NpcConfig.get(quest.targetNpc)
	return {
		id = quest.id,
		title = quest.title,
		levelReq = quest.levelReq,
		targetName = target and target.name or quest.targetNpc,
		targetLevel = target and target.level or 0,
		amount = quest.amount,
		xpReward = quest.xpReward,
		beliReward = quest.beliReward,
		eligible = data.level >= quest.levelReq,
	}
end

local function openBoard(player, giverId)
	local data = DataService.get(player)
	local giver = giverQuests[giverId]
	if not data or not giver then
		return
	end

	local payload = {}
	for _, questId in ipairs(giver.quests) do
		local quest = QuestConfig.get(questId)
		if quest then
			table.insert(payload, questPayload(quest, data))
		end
	end

	Net.event("QuestOffer"):FireClient(player, giver.name, payload)
end

local function onAcceptQuest(player, questId)
	local data = DataService.get(player)
	if not data or type(questId) ~= "string" then
		return
	end

	local quest = QuestConfig.get(questId)
	if not quest then
		return
	end

	if data.level < quest.levelReq then
		notify(player, string.format("Requer nível %d.", quest.levelReq), "error")
		return
	end

	if data.quest and data.quest.id == questId then
		notify(player, "Você já está nesta missão.", "info")
		return
	end

	data.quest = { id = questId, progress = 0 }
	notify(player, string.format("Missão aceita: %s", quest.title), "success")
	DataService.push(player)
end

local function onAbandonQuest(player)
	local data = DataService.get(player)
	if not data or not data.quest then
		return
	end

	data.quest = nil
	notify(player, "Missão abandonada.", "info")
	DataService.push(player)
end

-- Chamado pelo NpcService a cada abate creditado ao jogador.
function QuestService.registerKill(player, npcId)
	local data = DataService.get(player)
	if not data or not data.quest then
		return
	end

	local quest = QuestConfig.get(data.quest.id)
	if not quest or quest.targetNpc ~= npcId then
		return
	end

	data.quest.progress += 1

	if data.quest.progress < quest.amount then
		DataService.push(player)
		return
	end

	-- Concluída: limpa antes de pagar para o snapshot enviado pelo addXp já
	-- refletir a missão encerrada.
	data.quest = nil
	notify(
		player,
		string.format("Missão concluída: %s  (+%d XP, +%d Beli)", quest.title, quest.xpReward, quest.beliReward),
		"success"
	)
	LevelService.addBeli(player, quest.beliReward)
	LevelService.addXp(player, quest.xpReward)
	DataService.push(player)
end

function QuestService.start()
	Net.event("AcceptQuest").OnServerEvent:Connect(onAcceptQuest)
	Net.event("AbandonQuest").OnServerEvent:Connect(onAbandonQuest)

	local function hookGiver(model)
		local giverId = model:GetAttribute("GiverId")
		local prompt = model:FindFirstChildWhichIsA("ProximityPrompt", true)
		if not giverId or not prompt then
			return
		end

		prompt.Triggered:Connect(function(player)
			openBoard(player, giverId)
		end)
	end

	for _, model in ipairs(CollectionService:GetTagged("QuestGiver")) do
		hookGiver(model)
	end
	CollectionService:GetInstanceAddedSignal("QuestGiver"):Connect(hookGiver)
end

return QuestService
