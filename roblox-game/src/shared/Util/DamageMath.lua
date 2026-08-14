--[[
	DamageMath
	Única fonte de verdade do cálculo de dano. Fica em shared para que o
	cliente possa mostrar dano estimado na UI, mas apenas o servidor aplica.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")

local GameConfig = require(Shared.Config.GameConfig)

local DamageMath = {}

--[[
	baseDamage: dano da arma ou do golpe
	statPoints: pontos investidos na categoria que escala esse ataque
	level:      nível do atacante
]]
function DamageMath.compute(baseDamage, statPoints, level)
	local statBonus = 1 + (statPoints or 0) * GameConfig.DamagePerStatPoint
	local levelBonus = 1 + math.max(0, (level or 1) - 1) * GameConfig.DamagePerLevel
	return math.max(1, math.floor(baseDamage * statBonus * levelBonus))
end

function DamageMath.maxHealth(level, defensePoints)
	return GameConfig.BaseMaxHealth
		+ math.max(0, (level or 1) - 1) * GameConfig.HealthPerLevel
		+ (defensePoints or 0) * GameConfig.HealthPerDefensePoint
end

return DamageMath
