--[[
	QuestConfig
	Missões de caça. Como em Blox Fruits, o jogador carrega uma missão ativa
	por vez e o progresso conta abates do NPC alvo.
]]

local QuestConfig = {}

QuestConfig.Quests = {
	bandit_hunt = {
		id = "bandit_hunt",
		title = "Limpar a Vila dos Bandidos",
		levelReq = 1,
		targetNpc = "Bandido",
		amount = 8,
		xpReward = 500,
		beliReward = 400,
	},

	monkey_hunt = {
		id = "monkey_hunt",
		title = "Domar as Ruínas",
		levelReq = 20,
		targetNpc = "MacacoSelvagem",
		amount = 10,
		xpReward = 3000,
		beliReward = 1600,
	},

	pirate_hunt = {
		id = "pirate_hunt",
		title = "Piratas do Porto",
		levelReq = 40,
		targetNpc = "PirataNovato",
		amount = 10,
		xpReward = 11000,
		beliReward = 4500,
	},

	marine_hunt = {
		id = "marine_hunt",
		title = "Cerco à Fortaleza",
		levelReq = 70,
		targetNpc = "SoldadoMarinha",
		amount = 12,
		xpReward = 34000,
		beliReward = 12000,
	},

	captain_raid = {
		id = "captain_raid",
		title = "Derrube o Capitão",
		levelReq = 95,
		targetNpc = "CapitaoMarinha",
		amount = 1,
		xpReward = 90000,
		beliReward = 40000,
	},
}

function QuestConfig.get(questId)
	return QuestConfig.Quests[questId]
end

return QuestConfig
