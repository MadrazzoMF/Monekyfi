--[[
	FruitConfig
	As frutas e seus três golpes (Z, X, C). Todo dano de fruta escala com o
	stat "Fruit".

	Formatos de golpe (kind):
		"Projectile"  -> parte que viaja na direção da mira e explode no impacto
		"AreaAtTarget"-> explosão imediata na posição da mira (limitada por range)
		"ConeInFront" -> cone à frente do personagem
		"AroundSelf"  -> explosão centrada no próprio jogador
]]

local FruitConfig = {}

FruitConfig.Fruits = {
	Chama = {
		id = "Chama",
		name = "Fruta Chama",
		rarity = "Comum",
		weight = 40, -- peso no sorteio de spawn
		price = 7500,
		color = Color3.fromRGB(255, 110, 40),
		element = "Fire",
		moves = {
			{
				key = "Z",
				name = "Bola de Fogo",
				kind = "Projectile",
				baseDamage = 28,
				cooldown = 3,
				speed = 95,
				radius = 7,
				range = 130,
			},
			{
				key = "X",
				name = "Lança-Chamas",
				kind = "ConeInFront",
				baseDamage = 34,
				cooldown = 7,
				range = 32,
				angle = 40,
			},
			{
				key = "C",
				name = "Explosão Flamejante",
				kind = "AroundSelf",
				baseDamage = 52,
				cooldown = 14,
				radius = 22,
			},
		},
	},

	Gelo = {
		id = "Gelo",
		name = "Fruta Gelo",
		rarity = "Incomum",
		weight = 25,
		price = 14000,
		color = Color3.fromRGB(140, 220, 255),
		element = "Ice",
		moves = {
			{
				key = "Z",
				name = "Lança de Gelo",
				kind = "Projectile",
				baseDamage = 32,
				cooldown = 3.5,
				speed = 110,
				radius = 6,
				range = 140,
			},
			{
				key = "X",
				name = "Campo Congelante",
				kind = "AreaAtTarget",
				baseDamage = 40,
				cooldown = 8,
				radius = 16,
				range = 70,
			},
			{
				key = "C",
				name = "Era Glacial",
				kind = "AroundSelf",
				baseDamage = 60,
				cooldown = 16,
				radius = 26,
			},
		},
	},

	Areia = {
		id = "Areia",
		name = "Fruta Areia",
		rarity = "Rara",
		weight = 18,
		price = 26000,
		color = Color3.fromRGB(225, 195, 120),
		element = "Sand",
		moves = {
			{
				key = "Z",
				name = "Tiro de Areia",
				kind = "Projectile",
				baseDamage = 38,
				cooldown = 3.5,
				speed = 100,
				radius = 7,
				range = 140,
			},
			{
				key = "X",
				name = "Tempestade de Areia",
				kind = "AreaAtTarget",
				baseDamage = 50,
				cooldown = 9,
				radius = 18,
				range = 80,
			},
			{
				key = "C",
				name = "Deserto Sepultura",
				kind = "AroundSelf",
				baseDamage = 74,
				cooldown = 18,
				radius = 28,
			},
		},
	},

	Raio = {
		id = "Raio",
		name = "Fruta Raio",
		rarity = "Lendária",
		weight = 12,
		price = 45000,
		color = Color3.fromRGB(255, 230, 90),
		element = "Lightning",
		moves = {
			{
				key = "Z",
				name = "Descarga",
				kind = "Projectile",
				baseDamage = 46,
				cooldown = 3,
				speed = 160,
				radius = 7,
				range = 160,
			},
			{
				key = "X",
				name = "Trovão Caído",
				kind = "AreaAtTarget",
				baseDamage = 62,
				cooldown = 9,
				radius = 17,
				range = 90,
			},
			{
				key = "C",
				name = "Julgamento",
				kind = "AroundSelf",
				baseDamage = 92,
				cooldown = 20,
				radius = 30,
			},
		},
	},

	Luz = {
		id = "Luz",
		name = "Fruta Luz",
		rarity = "Mítica",
		weight = 5,
		price = 80000,
		color = Color3.fromRGB(255, 250, 200),
		element = "Light",
		moves = {
			{
				key = "Z",
				name = "Raio Perfurante",
				kind = "Projectile",
				baseDamage = 58,
				cooldown = 2.8,
				speed = 200,
				radius = 6,
				range = 180,
			},
			{
				key = "X",
				name = "Prisão de Luz",
				kind = "AreaAtTarget",
				baseDamage = 78,
				cooldown = 8.5,
				radius = 18,
				range = 100,
			},
			{
				key = "C",
				name = "Aurora",
				kind = "AroundSelf",
				baseDamage = 116,
				cooldown = 22,
				radius = 32,
			},
		},
	},
}

FruitConfig.Order = { "Chama", "Gelo", "Areia", "Raio", "Luz" }

FruitConfig.RarityColor = {
	["Comum"] = Color3.fromRGB(190, 190, 190),
	["Incomum"] = Color3.fromRGB(120, 220, 140),
	["Rara"] = Color3.fromRGB(110, 170, 255),
	["Lendária"] = Color3.fromRGB(255, 200, 80),
	["Mítica"] = Color3.fromRGB(235, 130, 255),
}

function FruitConfig.get(fruitId)
	return FruitConfig.Fruits[fruitId]
end

function FruitConfig.getMove(fruitId, moveKey)
	local fruit = FruitConfig.Fruits[fruitId]
	if not fruit then
		return nil
	end
	for _, move in ipairs(fruit.moves) do
		if move.key == moveKey then
			return move
		end
	end
	return nil
end

-- Sorteio ponderado usado pelo FruitService a cada spawn no mundo.
function FruitConfig.roll(random)
	local total = 0
	for _, fruitId in ipairs(FruitConfig.Order) do
		total += FruitConfig.Fruits[fruitId].weight
	end

	local pick = random:NextNumber() * total
	for _, fruitId in ipairs(FruitConfig.Order) do
		pick -= FruitConfig.Fruits[fruitId].weight
		if pick <= 0 then
			return fruitId
		end
	end

	return FruitConfig.Order[1]
end

return FruitConfig
