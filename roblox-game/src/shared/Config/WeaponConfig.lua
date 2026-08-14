--[[
	WeaponConfig
	Armas equipáveis. O M1 (clique esquerdo) usa a arma equipada.

	kind:
		"Melee"    -> hitbox esférica na frente do personagem
		"Hitscan"  -> raycast instantâneo até a mira
]]

local WeaponConfig = {}

WeaponConfig.Weapons = {
	Fists = {
		id = "Fists",
		name = "Punhos",
		kind = "Melee",
		stat = "Melee",
		baseDamage = 12,
		range = 9, -- quão à frente o centro da hitbox nasce
		hitRadius = 5.5,
		cooldown = 0.45,
		price = 0,
		levelReq = 0,
		color = Color3.fromRGB(255, 214, 170),
	},

	Katana = {
		id = "Katana",
		name = "Katana",
		kind = "Melee",
		stat = "Sword",
		baseDamage = 21,
		range = 11,
		hitRadius = 6.5,
		cooldown = 0.55,
		price = 2500,
		levelReq = 10,
		color = Color3.fromRGB(200, 215, 235),
	},

	Flintlock = {
		id = "Flintlock",
		name = "Pistola",
		kind = "Hitscan",
		stat = "Gun",
		baseDamage = 26,
		range = 140,
		hitRadius = 0,
		cooldown = 0.9,
		price = 6000,
		levelReq = 15,
		color = Color3.fromRGB(120, 90, 60),
	},
}

-- Ordem de exibição na loja.
WeaponConfig.Order = { "Fists", "Katana", "Flintlock" }

WeaponConfig.Default = "Fists"

function WeaponConfig.get(weaponId)
	return WeaponConfig.Weapons[weaponId]
end

return WeaponConfig
