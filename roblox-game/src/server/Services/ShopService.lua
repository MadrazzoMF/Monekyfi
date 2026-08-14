--[[
	ShopService
	Compra e troca de armas. A loja vive no menu do cliente (aba "Armas"), por
	isso não existe NPC vendedor — mas as regras são todas validadas aqui.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local WeaponConfig = require(Shared.Config.WeaponConfig)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)
local CharacterService = require(script.Parent.CharacterService)

local ShopService = {}

local function notify(player, text, kind)
	Net.event("Notify"):FireClient(player, text, kind or "info")
end

local function onBuyWeapon(player, weaponId)
	local data = DataService.get(player)
	if not data or type(weaponId) ~= "string" then
		return
	end

	local weapon = WeaponConfig.get(weaponId)
	if not weapon then
		return
	end

	if table.find(data.weapons, weaponId) then
		notify(player, "Você já tem esta arma.", "info")
		return
	end

	if data.level < weapon.levelReq then
		notify(player, string.format("%s requer nível %d.", weapon.name, weapon.levelReq), "error")
		return
	end

	if data.beli < weapon.price then
		notify(player, string.format("Faltam %d Beli.", weapon.price - data.beli), "error")
		return
	end

	data.beli -= weapon.price
	table.insert(data.weapons, weaponId)
	data.equipped = weaponId

	notify(player, string.format("%s comprada e equipada!", weapon.name), "success")
	CharacterService.refreshWeaponModel(player)
	DataService.push(player)
end

local function onEquipWeapon(player, weaponId)
	local data = DataService.get(player)
	if not data or type(weaponId) ~= "string" then
		return
	end

	if not WeaponConfig.get(weaponId) or not table.find(data.weapons, weaponId) then
		return
	end

	data.equipped = weaponId
	CharacterService.refreshWeaponModel(player)
	DataService.push(player)
end

function ShopService.start()
	Net.event("BuyWeapon").OnServerEvent:Connect(onBuyWeapon)
	Net.event("EquipWeapon").OnServerEvent:Connect(onEquipWeapon)
end

return ShopService
