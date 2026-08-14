--[[
	MenuController
	Menu do jogador (tecla M): distribuição de stats e loja de armas.
	Os botões só pedem — quem valida nível, preço e limite é o servidor.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local StatConfig = require(Shared.Config.StatConfig)
local WeaponConfig = require(Shared.Config.WeaponConfig)
local DamageMath = require(Shared.Util.DamageMath)
local Net = require(Shared.Net)

local Ui = require(script.Parent.Parent.Ui)
local ClientState = require(script.Parent.Parent.ClientState)

local MenuController = {}

local Theme = Ui.Theme

local window = nil
local pages = {}
local tabButtons = {}
local statRows = {}
local weaponRows = {}
local pointsLabel = nil
local activePage = "Stats"

-- Construção -----------------------------------------------------------------

local function buildStatRow(parent, statId, order)
	local row = Ui.new("Frame", {
		Size = UDim2.new(1, 0, 0, 34),
		BackgroundTransparency = 1,
		LayoutOrder = order,
		Parent = parent,
	})

	Ui.label({
		Size = UDim2.new(0.4, 0, 1, 0),
		Font = Enum.Font.GothamBold,
		TextSize = 14,
		Text = StatConfig.Display[statId],
		Parent = row,
	})

	local description = Ui.label({
		Position = UDim2.fromScale(0.4, 0),
		Size = UDim2.new(0.28, 0, 1, 0),
		TextSize = 11,
		TextColor3 = Theme.textDim,
		TextWrapped = true,
		Text = StatConfig.Description[statId],
		Parent = row,
	})

	local valueLabel = Ui.label({
		Position = UDim2.fromScale(0.68, 0),
		Size = UDim2.new(0.12, 0, 1, 0),
		Font = Enum.Font.GothamBold,
		TextSize = 15,
		TextXAlignment = Enum.TextXAlignment.Center,
		TextColor3 = Theme.accent,
		Text = "0",
		Parent = row,
	})

	local plusOne = Ui.button({
		Position = UDim2.new(0.8, 0, 0.5, 0),
		AnchorPoint = Vector2.new(0, 0.5),
		Size = UDim2.new(0.09, 0, 0, 26),
		Text = "+1",
		Parent = row,
	})

	local plusTen = Ui.button({
		Position = UDim2.new(0.9, 4, 0.5, 0),
		AnchorPoint = Vector2.new(0, 0.5),
		Size = UDim2.new(0.09, 0, 0, 26),
		Text = "+10",
		Parent = row,
	})

	plusOne.MouseButton1Click:Connect(function()
		Net.event("AllocateStat"):FireServer(statId, 1)
	end)
	plusTen.MouseButton1Click:Connect(function()
		Net.event("AllocateStat"):FireServer(statId, 10)
	end)

	statRows[statId] = { valueLabel = valueLabel, description = description }
end

local function buildStatsPage(parent)
	local page = Ui.new("Frame", {
		Name = "Stats",
		Size = UDim2.fromScale(1, 1),
		BackgroundTransparency = 1,
		Visible = true,
		Parent = parent,
	})

	pointsLabel = Ui.label({
		Size = UDim2.new(1, 0, 0, 22),
		Font = Enum.Font.GothamBold,
		TextSize = 15,
		TextColor3 = Theme.accent,
		Text = "Pontos disponíveis: 0",
		Parent = page,
	})

	local list = Ui.new("Frame", {
		Position = UDim2.fromOffset(0, 30),
		Size = UDim2.new(1, 0, 1, -76),
		BackgroundTransparency = 1,
		Parent = page,
	}, {
		Ui.new("UIListLayout", { Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }),
	})

	for order, statId in ipairs(StatConfig.Order) do
		buildStatRow(list, statId, order)
	end

	local resetButton = Ui.button({
		AnchorPoint = Vector2.new(0, 1),
		Position = UDim2.new(0, 0, 1, 0),
		Size = UDim2.new(0, 220, 0, 30),
		TextSize = 13,
		Text = "Resetar stats — 5.000 Beli",
		Parent = page,
	})
	resetButton.MouseButton1Click:Connect(function()
		Net.event("ResetStats"):FireServer()
	end)

	pages.Stats = page
end

local function buildWeaponRow(parent, weaponId, order)
	local weapon = WeaponConfig.get(weaponId)

	local row = Ui.panel({
		Size = UDim2.new(1, -6, 0, 62),
		BackgroundColor3 = Theme.panelLight,
		LayoutOrder = order,
		Parent = parent,
	})
	Ui.padding(row, 8)

	Ui.label({
		Size = UDim2.new(0.6, 0, 0, 18),
		Font = Enum.Font.GothamBold,
		TextSize = 14,
		Text = weapon.name,
		Parent = row,
	})

	Ui.label({
		Position = UDim2.fromOffset(0, 20),
		Size = UDim2.new(0.6, 0, 0, 14),
		TextSize = 11,
		TextColor3 = Theme.textDim,
		Text = string.format("Dano base %d · escala com %s", weapon.baseDamage, StatConfig.Display[weapon.stat]),
		Parent = row,
	})

	local requirement = Ui.label({
		Position = UDim2.fromOffset(0, 34),
		Size = UDim2.new(0.6, 0, 0, 14),
		TextSize = 11,
		TextColor3 = Theme.textDim,
		Text = "",
		Parent = row,
	})

	local action = Ui.button({
		AnchorPoint = Vector2.new(1, 0.5),
		Position = UDim2.new(1, 0, 0.5, 0),
		Size = UDim2.fromOffset(120, 30),
		Text = "Comprar",
		Parent = row,
	})

	action.MouseButton1Click:Connect(function()
		local data = ClientState.data
		if not data then
			return
		end
		if table.find(data.weapons, weaponId) then
			Net.event("EquipWeapon"):FireServer(weaponId)
		else
			Net.event("BuyWeapon"):FireServer(weaponId)
		end
	end)

	weaponRows[weaponId] = { requirement = requirement, action = action }
end

local function buildWeaponsPage(parent)
	local page = Ui.new("ScrollingFrame", {
		Name = "Armas",
		Size = UDim2.fromScale(1, 1),
		BackgroundTransparency = 1,
		BorderSizePixel = 0,
		ScrollBarThickness = 5,
		CanvasSize = UDim2.new(),
		AutomaticCanvasSize = Enum.AutomaticSize.Y,
		Visible = false,
		Parent = parent,
	}, {
		Ui.new("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder }),
	})

	for order, weaponId in ipairs(WeaponConfig.Order) do
		buildWeaponRow(page, weaponId, order)
	end

	pages.Armas = page
end

local function selectPage(name)
	activePage = name
	for pageName, page in pairs(pages) do
		page.Visible = (pageName == name)
	end
	for tabName, button in pairs(tabButtons) do
		button.BackgroundColor3 = (tabName == name) and Theme.accent or Theme.panelLight
		button.TextColor3 = (tabName == name) and Color3.fromRGB(30, 25, 10) or Theme.text
	end
end

-- Atualização ----------------------------------------------------------------

local function refresh(data)
	if not data or not window then
		return
	end

	pointsLabel.Text = string.format("Pontos disponíveis: %d", data.statPoints)

	for statId, row in pairs(statRows) do
		row.valueLabel.Text = tostring(data.stats[statId] or 0)
	end

	-- Mostra o efeito real da Defesa em vez de só o número do stat.
	if statRows.Defense then
		statRows.Defense.description.Text = string.format(
			"Vida máxima: %d",
			DamageMath.maxHealth(data.level, data.stats.Defense)
		)
	end

	for weaponId, row in pairs(weaponRows) do
		local weapon = WeaponConfig.get(weaponId)
		local owned = table.find(data.weapons, weaponId) ~= nil

		if owned then
			row.requirement.Text = "No inventário"
			row.requirement.TextColor3 = Theme.success
			if data.equipped == weaponId then
				row.action.Text = "Equipada"
				row.action.BackgroundColor3 = Theme.success
				row.action.TextColor3 = Color3.fromRGB(15, 30, 18)
			else
				row.action.Text = "Equipar"
				row.action.BackgroundColor3 = Theme.panel
				row.action.TextColor3 = Theme.text
			end
		else
			row.requirement.Text = string.format("%s Beli · Nível %d", Ui.short(weapon.price), weapon.levelReq)
			local affordable = data.beli >= weapon.price and data.level >= weapon.levelReq
			row.requirement.TextColor3 = affordable and Theme.success or Theme.danger
			row.action.Text = "Comprar"
			row.action.BackgroundColor3 = affordable and Theme.accent or Theme.panel
			row.action.TextColor3 = affordable and Color3.fromRGB(30, 25, 10) or Theme.textDim
		end
	end
end

function MenuController.setVisible(visible)
	if window then
		window.Visible = visible
	end
end

function MenuController.toggle()
	if window then
		window.Visible = not window.Visible
	end
end

function MenuController.start(screen)
	window = Ui.panel({
		Name = "Menu",
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5),
		Size = UDim2.fromOffset(560, 400),
		BackgroundTransparency = 0.05,
		Visible = false,
		Parent = screen,
	})
	Ui.padding(window, 14)

	Ui.label({
		Size = UDim2.new(1, 0, 0, 24),
		Font = Enum.Font.GothamBold,
		TextSize = 18,
		Text = "Personagem",
		Parent = window,
	})

	local closeButton = Ui.button({
		AnchorPoint = Vector2.new(1, 0),
		Position = UDim2.fromScale(1, 0),
		Size = UDim2.fromOffset(30, 26),
		Text = "X",
		Parent = window,
	})
	closeButton.MouseButton1Click:Connect(function()
		MenuController.setVisible(false)
	end)

	local tabBar = Ui.new("Frame", {
		Position = UDim2.fromOffset(0, 32),
		Size = UDim2.new(1, 0, 0, 30),
		BackgroundTransparency = 1,
		Parent = window,
	}, {
		Ui.new("UIListLayout", {
			FillDirection = Enum.FillDirection.Horizontal,
			Padding = UDim.new(0, 6),
			SortOrder = Enum.SortOrder.LayoutOrder,
		}),
	})

	local body = Ui.new("Frame", {
		Position = UDim2.fromOffset(0, 70),
		Size = UDim2.new(1, 0, 1, -70),
		BackgroundTransparency = 1,
		Parent = window,
	})

	buildStatsPage(body)
	buildWeaponsPage(body)

	for order, name in ipairs({ "Stats", "Armas" }) do
		local button = Ui.button({
			Size = UDim2.fromOffset(110, 28),
			LayoutOrder = order,
			Text = name,
			Parent = tabBar,
		})
		button.MouseButton1Click:Connect(function()
			selectPage(name)
		end)
		tabButtons[name] = button
	end

	selectPage(activePage)

	-- Botão para quem está no celular, onde não existe tecla M.
	local openButton = Ui.button({
		Name = "OpenMenu",
		Position = UDim2.fromOffset(16, 142),
		Size = UDim2.fromOffset(110, 30),
		Text = "Menu (M)",
		Parent = screen,
	})
	openButton.MouseButton1Click:Connect(MenuController.toggle)

	UserInputService.InputBegan:Connect(function(input, processedByGui)
		if processedByGui then
			return
		end
		if input.KeyCode == Enum.KeyCode.M then
			MenuController.toggle()
		elseif input.KeyCode == Enum.KeyCode.Escape and window.Visible then
			MenuController.setVisible(false)
		end
	end)

	ClientState.changed:Connect(refresh)
	if ClientState.data then
		refresh(ClientState.data)
	end
end

return MenuController
