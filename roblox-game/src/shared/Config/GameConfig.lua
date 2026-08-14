--[[
	GameConfig
	Ajustes globais de balanceamento. Mexer aqui muda o jogo inteiro sem
	precisar tocar em nenhum service.
]]

local GameConfig = {}

-- Persistência ---------------------------------------------------------------

-- Trocar o sufixo _v1 zera os dados de todos os jogadores (útil em testes).
GameConfig.DataStoreName = "MonkeyPirates_Player_v1"
GameConfig.AutoSaveInterval = 120 -- segundos entre salvamentos automáticos
GameConfig.SaveRetries = 4

-- Progressão -----------------------------------------------------------------

GameConfig.MaxLevel = 150
GameConfig.StatPointsPerLevel = 3
GameConfig.StartingBeli = 0

-- XP necessário para sair de `level` e chegar em `level + 1`.
function GameConfig.xpToNextLevel(level)
	return math.floor(50 + 45 * (level ^ 1.45))
end

-- Vida, velocidade e dano ----------------------------------------------------

GameConfig.BaseMaxHealth = 100
GameConfig.HealthPerLevel = 6
GameConfig.HealthPerDefensePoint = 9
GameConfig.BaseWalkSpeed = 20
GameConfig.RespawnTime = 5

-- Cada ponto investido numa categoria soma este percentual ao dano dela.
GameConfig.DamagePerStatPoint = 0.02

-- Cada nível soma este percentual ao dano (evita que level alto com stats
-- baixos fique inútil).
GameConfig.DamagePerLevel = 0.03

-- PVP ------------------------------------------------------------------------

GameConfig.PvpLevelRequirement = 10
GameConfig.PvpDamageMultiplier = 0.6 -- dano entre jogadores é reduzido

-- Anti-exploit ---------------------------------------------------------------

-- O servidor rejeita qualquer mira enviada pelo cliente além desta distância.
GameConfig.MaxAimDistance = 220

-- Margem de tolerância no cooldown para compensar latência. Sem isso, um
-- jogador com ping alto tomaria rejeição em ataques legítimos.
GameConfig.CooldownTolerance = 0.08

return GameConfig
