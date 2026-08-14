--[[
	NpcConfig
	Inimigos farmáveis. O NpcService monta o rig, roda a IA e paga as
	recompensas a partir destes números.
]]

local NpcConfig = {}

NpcConfig.Npcs = {
	Bandido = {
		id = "Bandido",
		name = "Bandido",
		level = 5,
		maxHealth = 120,
		damage = 9,
		attackCooldown = 1.6,
		attackRange = 7,
		aggroRange = 55,
		walkSpeed = 13,
		xpReward = 60,
		beliReward = 45,
		respawnTime = 8,
		-- Distância máxima do ponto de spawn antes de desistir da perseguição.
		leashRange = 90,
		bodyColor = Color3.fromRGB(105, 80, 65),
		shirtColor = Color3.fromRGB(60, 60, 70),
	},

	MacacoSelvagem = {
		id = "MacacoSelvagem",
		name = "Macaco Selvagem",
		level = 22,
		maxHealth = 420,
		damage = 22,
		attackCooldown = 1.3,
		attackRange = 7,
		aggroRange = 60,
		walkSpeed = 17,
		xpReward = 260,
		beliReward = 130,
		respawnTime = 9,
		leashRange = 100,
		bodyColor = Color3.fromRGB(95, 65, 40),
		shirtColor = Color3.fromRGB(140, 100, 60),
	},

	PirataNovato = {
		id = "PirataNovato",
		name = "Pirata Novato",
		level = 45,
		maxHealth = 1100,
		damage = 45,
		attackCooldown = 1.5,
		attackRange = 8,
		aggroRange = 65,
		walkSpeed = 15,
		xpReward = 900,
		beliReward = 380,
		respawnTime = 10,
		leashRange = 110,
		bodyColor = Color3.fromRGB(200, 160, 130),
		shirtColor = Color3.fromRGB(120, 40, 45),
	},

	SoldadoMarinha = {
		id = "SoldadoMarinha",
		name = "Soldado da Marinha",
		level = 75,
		maxHealth = 2600,
		damage = 78,
		attackCooldown = 1.4,
		attackRange = 8,
		aggroRange = 70,
		walkSpeed = 16,
		xpReward = 2400,
		beliReward = 900,
		respawnTime = 12,
		leashRange = 120,
		bodyColor = Color3.fromRGB(215, 180, 150),
		shirtColor = Color3.fromRGB(235, 235, 240),
	},

	CapitaoMarinha = {
		id = "CapitaoMarinha",
		name = "Capitão da Marinha",
		level = 100,
		maxHealth = 12000,
		damage = 140,
		attackCooldown = 1.2,
		attackRange = 11,
		aggroRange = 90,
		walkSpeed = 18,
		xpReward = 15000,
		beliReward = 6000,
		respawnTime = 300,
		leashRange = 160,
		isBoss = true,
		scale = 1.35,
		bodyColor = Color3.fromRGB(215, 180, 150),
		shirtColor = Color3.fromRGB(35, 55, 110),
	},
}

function NpcConfig.get(npcId)
	return NpcConfig.Npcs[npcId]
end

return NpcConfig
