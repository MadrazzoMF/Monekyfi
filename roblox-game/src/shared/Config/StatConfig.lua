--[[
	StatConfig
	As categorias de stat que o jogador distribui ao subir de nível.
	Cada arma/fruta declara qual destas categorias escala o dano dela.
]]

local StatConfig = {}

-- A ordem aqui define a ordem no menu de stats do cliente.
StatConfig.Order = { "Melee", "Defense", "Sword", "Gun", "Fruit" }

StatConfig.Display = {
	Melee = "Combate",
	Defense = "Defesa",
	Sword = "Espada",
	Gun = "Arma de Fogo",
	Fruit = "Fruta",
}

StatConfig.Description = {
	Melee = "Aumenta o dano dos punhos.",
	Defense = "Aumenta sua vida máxima.",
	Sword = "Aumenta o dano de espadas.",
	Gun = "Aumenta o dano de armas de fogo.",
	Fruit = "Aumenta o dano dos poderes da fruta.",
}

StatConfig.MaxPerStat = 400

function StatConfig.isValid(statId)
	return StatConfig.Display[statId] ~= nil
end

-- Tabela de stats zerada, usada para novos jogadores e para preencher
-- categorias que ainda não existiam em saves antigos.
function StatConfig.blank()
	local stats = {}
	for _, statId in ipairs(StatConfig.Order) do
		stats[statId] = 0
	end
	return stats
end

return StatConfig
