--[[
	Bootstrap do servidor.

	A ordem abaixo importa:
	  1. Net cria os remotes antes de qualquer service tentar usá-los.
	  2. MapBuilder cria o mundo e os marcadores que NpcService, FruitService,
	     QuestService e TravelService procuram no start().
	  3. DataService antes de tudo que lê perfil.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared.Net)

local MapBuilder = require(script.World.MapBuilder)

local Services = script.Services
local DataService = require(Services.DataService)
local LevelService = require(Services.LevelService)
local CharacterService = require(Services.CharacterService)
local NpcService = require(Services.NpcService)
local CombatService = require(Services.CombatService)
local QuestService = require(Services.QuestService)
local FruitService = require(Services.FruitService)
local ShopService = require(Services.ShopService)
local TravelService = require(Services.TravelService)

local startClock = os.clock()

Net.initServer()
MapBuilder.build()

DataService.start()
LevelService.start()
CharacterService.start()
QuestService.start()
NpcService.start()
CombatService.start()
FruitService.start()
ShopService.start()
TravelService.start()

print(string.format("[Servidor] pronto em %.2fs", os.clock() - startClock))
