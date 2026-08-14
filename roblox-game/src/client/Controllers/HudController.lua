--[[
	HudController
	Nível, XP, Beli, fruta, vida, zona atual, missão ativa e a barra de golpes
	com cooldown. Tudo construído por código.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local StarterGui = game:GetService("StarterGui")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)
local FruitConfig = require(Shared.Config.FruitConfig)
local QuestConfig = require(Shared.Config.QuestConfig)
local WeaponConfig = require(Shared.Config.WeaponConfig)
local ZoneConfig = require(Shared.Config.ZoneConfig)
local Net = require(Shared.Net)

local Ui = require(script.Parent.Parent.Ui)
local ClientState = require(script.Parent.Parent.ClientState)

local HudController = {}

local player = Players.LocalPlayer
local Theme = Ui.Theme

local SLOT_ORDER = { "M1", "Z", "X", "C" }

local widgets = {}
local slots = {}

-- Construção -----------------------------------------------------------------

local function buildProfilePanel(screen)
	local panel = Ui.panel({
		Name = "Profile",
		Position = UDim2.fromOffset(16, 16),
		Size = UDim2.fromOffset(250, 118),
		BackgroundTransparency = 0.1,
		Parent = screen,
	})
	Ui.padding(panel, 10)

	widgets.levelLabel = Ui.label({
		Size = UDim2.new(1, 0, 0, 22),
		Font = Enum.Font.GothamBold,
		TextSize = 18,
		TextColor3 = Theme.accent,
		Text = "Nível 1",
		Parent = panel,
	})

	widgets.nameLabel = Ui.label({
		Position = UDim2.fromOffset(0, 22),
		Size = UDim2.new(1, 0, 0, 16),
		TextSize = 13,
		TextColor3 = Theme.textDim,
		Text = player.DisplayName,
		Parent = panel,
	})

	local xpBack
	xpBack, widgets.xpFill = Ui.bar({
		Position = UDim2.fromOffset(0, 44),
		Size = UDim2.new(1, 0, 0, 16),
		Parent = panel,
	}, Theme.xp)

	widgets.xpLabel = Ui.label({
		Size = UDim2.fromScale(1, 1),
		Font = Enum.Font.GothamBold,
		TextSize = 11,
		TextXAlignment = Enum.TextXAlignment.Center,
		Text = "0 / 0",
		Parent = xpBack,
	})

	widgets.beliLabel = Ui.label({
		Position = UDim2.fromOffset(0, 66),
		Size = UDim2.new(1, 0, 0, 16),
		Font = Enum.Font.GothamBold,
		TextSize = 13,
		TextColor3 = Theme.beli,
		Text = "0 Beli",
		Parent = panel,
	})

	widgets.fruitLabel = Ui.label({
		Position = UDim2.fromOffset(0, 84),
		Size = UDim2.new(1, 0, 0, 16),
		TextSize = 13,
		TextColor3 = Theme.textDim,
		Text = "Fruta: nenhuma",
		Parent = panel,
	})
end

local function buildHealthBar(screen)
	local container = Ui.new("Frame", {
		Name = "Health",
		AnchorPoint = Vector2.new(0.5, 1),
		Position = UDim2.new(0.5, 0, 1, -18),
		Size = UDim2.fromOffset(340, 24),
		BackgroundTransparency = 1,
		Parent = screen,
	})

	local back
	back, widgets.healthFill = Ui.bar({
		Size = UDim2.fromScale(1, 1),
		Parent = container,
	}, Theme.health)
	Ui.stroke(back)

	widgets.healthLabel = Ui.label({
		Size = UDim2.fromScale(1, 1),
		Font = Enum.Font.GothamBold,
		TextSize = 13,
		TextXAlignment = Enum.TextXAlignment.Center,
		Text = "100 / 100",
		Parent = back,
	})
end

local function buildSkillBar(screen)
	local container = Ui.new("Frame", {
		Name = "Skills",
		Position = UDim2.new(0, 16, 1, -18),
		AnchorPoint = Vector2.new(0, 1),
		Size = UDim2.fromOffset(4 * 74, 74),
		BackgroundTransparency = 1,
		Parent = screen,
	})

	Ui.new("UIListLayout", {
		FillDirection = Enum.FillDirection.Horizontal,
		Padding = UDim.new(0, 8),
		SortOrder = Enum.SortOrder.LayoutOrder,
		Parent = container,
	})

	for index, key in ipairs(SLOT_ORDER) do
		local frame = Ui.panel({
			Name = key,
			Size = UDim2.fromOffset(66, 66),
			LayoutOrder = index,
			BackgroundTransparency = 0.1,
			Parent = container,
		})

		local keyLabel = Ui.label({
			Position = UDim2.fromOffset(0, 4),
			Size = UDim2.new(1, 0, 0, 20),
			Font = Enum.Font.GothamBold,
			TextSize = 16,
			TextXAlignment = Enum.TextXAlignment.Center,
			TextColor3 = Theme.accent,
			Text = key,
			Parent = frame,
		})

		local nameLabel = Ui.label({
			AnchorPoint = Vector2.new(0.5, 1),
			Position = UDim2.new(0.5, 0, 1, -4),
			Size = UDim2.new(1, -6, 0, 26),
			TextSize = 10,
			TextWrapped = true,
			TextXAlignment = Enum.TextXAlignment.Center,
			TextColor3 = Theme.textDim,
			Text = "—",
			Parent = frame,
		})

		-- Cobertura que desce conforme o cooldown corre.
		local cover = Ui.new("Frame", {
			Name = "Cover",
			AnchorPoint = Vector2.new(0, 1),
			Position = UDim2.fromScale(0, 1),
			Size = UDim2.fromScale(1, 0),
			BackgroundColor3 = Color3.fromRGB(0, 0, 0),
			BackgroundTransparency = 0.45,
			BorderSizePixel = 0,
			Parent = frame,
		})
		Ui.corner(cover, 10)

		local timerLabel = Ui.label({
			Size = UDim2.fromScale(1, 1),
			Font = Enum.Font.GothamBold,
			TextSize = 18,
			TextXAlignment = Enum.TextXAlignment.Center,
			Text = "",
			Parent = frame,
		})

		slots[key] = {
			frame = frame,
			keyLabel = keyLabel,
			nameLabel = nameLabel,
			cover = cover,
			timerLabel = timerLabel,
			expiry = 0,
			duration = 1,
		}
	end
end

local function buildZonePanel(screen)
	local panel = Ui.panel({
		Name = "Zone",
		AnchorPoint = Vector2.new(1, 0),
		Position = UDim2.new(1, -16, 0, 16),
		Size = UDim2.fromOffset(240, 118),
		BackgroundTransparency = 0.1,
		Parent = screen,
	})
	Ui.padding(panel, 10)

	widgets.zoneLabel = Ui.label({
		Size = UDim2.new(1, 0, 0, 20),
		Font = Enum.Font.GothamBold,
		TextSize = 15,
		TextXAlignment = Enum.TextXAlignment.Right,
		Text = "—",
		Parent = panel,
	})

	widgets.zoneSub = Ui.label({
		Position = UDim2.fromOffset(0, 20),
		Size = UDim2.new(1, 0, 0, 16),
		TextSize = 12,
		TextXAlignment = Enum.TextXAlignment.Right,
		TextColor3 = Theme.textDim,
		Text = "",
		Parent = panel,
	})

	widgets.questTitle = Ui.label({
		Position = UDim2.fromOffset(0, 44),
		Size = UDim2.new(1, 0, 0, 18),
		Font = Enum.Font.GothamBold,
		TextSize = 13,
		TextXAlignment = Enum.TextXAlignment.Right,
		Text = "Sem missão ativa",
		Parent = panel,
	})

	widgets.questProgress = Ui.label({
		Position = UDim2.fromOffset(0, 62),
		Size = UDim2.new(1, 0, 0, 16),
		TextSize = 12,
		TextXAlignment = Enum.TextXAlignment.Right,
		TextColor3 = Theme.textDim,
		Text = "Fale com um NPC de missão",
		Parent = panel,
	})

	widgets.abandonButton = Ui.button({
		AnchorPoint = Vector2.new(1, 1),
		Position = UDim2.new(1, 0, 1, 0),
		Size = UDim2.fromOffset(110, 22),
		TextSize = 12,
		Text = "Abandonar",
		Visible = false,
		Parent = panel,
	})
	widgets.abandonButton.MouseButton1Click:Connect(function()
		Net.event("AbandonQuest"):FireServer()
	end)
end

local function buildHint(screen)
	Ui.label({
		AnchorPoint = Vector2.new(0.5, 1),
		Position = UDim2.new(0.5, 0, 1, -50),
		Size = UDim2.fromOffset(520, 16),
		TextSize = 12,
		TextXAlignment = Enum.TextXAlignment.Center,
		TextColor3 = Theme.textDim,
		Text = "Clique = ataque   ·   Z / X / C = golpes da fruta   ·   M = menu   ·   E perto de NPCs e frutas",
		Parent = screen,
	})
end

-- Atualização ----------------------------------------------------------------

local function refreshFromState(data)
	if not data then
		return
	end

	widgets.levelLabel.Text = string.format("Nível %d", data.level)

	local needed = GameConfig.xpToNextLevel(data.level)
	if data.level >= GameConfig.MaxLevel then
		widgets.xpFill.Size = UDim2.fromScale(1, 1)
		widgets.xpLabel.Text = "NÍVEL MÁXIMO"
	else
		widgets.xpFill.Size = UDim2.fromScale(math.clamp(data.xp / needed, 0, 1), 1)
		widgets.xpLabel.Text = string.format("%s / %s", Ui.short(data.xp), Ui.short(needed))
	end

	widgets.beliLabel.Text = string.format("%s Beli", Ui.short(data.beli))

	local fruit = data.fruit and FruitConfig.get(data.fruit)
	widgets.fruitLabel.Text = fruit and string.format("Fruta: %s", fruit.name) or "Fruta: nenhuma"
	widgets.fruitLabel.TextColor3 = fruit and (FruitConfig.RarityColor[fruit.rarity] or Theme.text) or Theme.textDim

	-- Slot do M1 mostra a arma equipada; Z/X/C mostram os golpes da fruta.
	local weapon = WeaponConfig.get(data.equipped)
	slots.M1.nameLabel.Text = weapon and weapon.name or "—"

	for _, key in ipairs({ "Z", "X", "C" }) do
		local move = fruit and FruitConfig.getMove(data.fruit, key)
		slots[key].nameLabel.Text = move and move.name or "—"
		slots[key].keyLabel.TextColor3 = move and Theme.accent or Theme.textDim
	end

	if data.quest then
		local quest = QuestConfig.get(data.quest.id)
		if quest then
			widgets.questTitle.Text = quest.title
			widgets.questProgress.Text = string.format("%d / %d abates", data.quest.progress, quest.amount)
			widgets.abandonButton.Visible = true
			return
		end
	end

	widgets.questTitle.Text = "Sem missão ativa"
	widgets.questProgress.Text = "Fale com um NPC de missão"
	widgets.abandonButton.Visible = false
end

local function refreshHealth(humanoid)
	if not humanoid then
		return
	end
	local maxHealth = math.max(1, humanoid.MaxHealth)
	local ratio = math.clamp(humanoid.Health / maxHealth, 0, 1)

	widgets.healthFill.Size = UDim2.fromScale(ratio, 1)
	widgets.healthFill.BackgroundColor3 = ratio > 0.4 and Theme.health
		or ratio > 0.2 and Theme.accent
		or Theme.danger
	widgets.healthLabel.Text = string.format("%d / %d", math.ceil(humanoid.Health), math.floor(maxHealth))
end

local function bindCharacter(character)
	local humanoid = character:WaitForChild("Humanoid", 10)
	if not humanoid then
		return
	end

	refreshHealth(humanoid)
	humanoid.HealthChanged:Connect(function()
		refreshHealth(humanoid)
	end)
	humanoid:GetPropertyChangedSignal("MaxHealth"):Connect(function()
		refreshHealth(humanoid)
	end)
end

local function refreshZone()
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if not root then
		return
	end

	local zone = ZoneConfig.zoneAt(root.Position)
	if not zone then
		widgets.zoneLabel.Text = "Mar Aberto"
		widgets.zoneLabel.TextColor3 = Theme.xp
		widgets.zoneSub.Text = "PVP liberado"
		return
	end

	widgets.zoneLabel.Text = zone.name
	widgets.zoneLabel.TextColor3 = zone.safe and Theme.success or Theme.text
	widgets.zoneSub.Text = zone.safe and string.format("Zona segura · Lv %d+", zone.levelRec)
		or string.format("PVP liberado · Lv %d+", zone.levelRec)
end

function HudController.startCooldown(key, duration)
	local slot = slots[key]
	if not slot or duration <= 0 then
		return
	end
	slot.duration = duration
	slot.expiry = os.clock() + duration
end

function HudController.start(screen)
	pcall(function()
		-- Temos nossa própria barra de vida.
		StarterGui:SetCoreGuiEnabled(Enum.CoreGuiType.Health, false)
	end)

	buildProfilePanel(screen)
	buildHealthBar(screen)
	buildSkillBar(screen)
	buildZonePanel(screen)
	buildHint(screen)

	ClientState.changed:Connect(refreshFromState)
	if ClientState.data then
		refreshFromState(ClientState.data)
	end

	Net.event("MoveResult").OnClientEvent:Connect(HudController.startCooldown)

	if player.Character then
		task.spawn(bindCharacter, player.Character)
	end
	player.CharacterAdded:Connect(function(character)
		task.spawn(bindCharacter, character)
	end)

	RunService.RenderStepped:Connect(function()
		local now = os.clock()
		for _, slot in pairs(slots) do
			local remaining = slot.expiry - now
			if remaining > 0 then
				slot.cover.Size = UDim2.fromScale(1, math.clamp(remaining / slot.duration, 0, 1))
				slot.timerLabel.Text = string.format("%.1f", remaining)
			elseif slot.cover.Size.Y.Scale > 0 then
				slot.cover.Size = UDim2.fromScale(1, 0)
				slot.timerLabel.Text = ""
			end
		end
	end)

	task.spawn(function()
		while true do
			refreshZone()
			task.wait(0.4)
		end
	end)
end

return HudController
