--[[
	Bootstrap do cliente.

	Um único ScreenGui é compartilhado por todos os controllers, com
	ResetOnSpawn desligado — sem isso a interface some a cada morte.
]]

local Players = game:GetService("Players")

local ClientState = require(script.ClientState)

local Controllers = script.Controllers
local HudController = require(Controllers.HudController)
local CombatController = require(Controllers.CombatController)
local MenuController = require(Controllers.MenuController)
local QuestController = require(Controllers.QuestController)
local NotifyController = require(Controllers.NotifyController)
local DamageController = require(Controllers.DamageController)

local player = Players.LocalPlayer

local screen = Instance.new("ScreenGui")
screen.Name = "GameUi"
screen.ResetOnSpawn = false
screen.IgnoreGuiInset = false
screen.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screen.Parent = player:WaitForChild("PlayerGui")

-- ClientState primeiro: os controllers desenham a partir do snapshot.
ClientState.start()

NotifyController.start(screen)
HudController.start(screen)
QuestController.start(screen)
MenuController.start(screen)
DamageController.start()
CombatController.start()
