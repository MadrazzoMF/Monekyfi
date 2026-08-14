--[[
	QuestController
	Quadro de missões que abre ao interagir (E) com um NPC de missão.
	O servidor manda a lista já com a marcação de elegibilidade.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared.Net)

local Ui = require(script.Parent.Parent.Ui)

local QuestController = {}

local Theme = Ui.Theme

local window = nil
local list = nil
local titleLabel = nil

local function clearList()
	for _, child in ipairs(list:GetChildren()) do
		if not child:IsA("UIListLayout") then
			child:Destroy()
		end
	end
end

local function buildQuestCard(quest, order)
	local card = Ui.panel({
		Size = UDim2.new(1, -6, 0, 92),
		BackgroundColor3 = Theme.panelLight,
		LayoutOrder = order,
		Parent = list,
	})
	Ui.padding(card, 10)

	Ui.label({
		Size = UDim2.new(0.68, 0, 0, 18),
		Font = Enum.Font.GothamBold,
		TextSize = 15,
		Text = quest.title,
		Parent = card,
	})

	Ui.label({
		Position = UDim2.fromOffset(0, 22),
		Size = UDim2.new(0.68, 0, 0, 16),
		TextSize = 12,
		TextColor3 = Theme.textDim,
		Text = string.format("Derrote %d × %s (Nv. %d)", quest.amount, quest.targetName, quest.targetLevel),
		Parent = card,
	})

	Ui.label({
		Position = UDim2.fromOffset(0, 40),
		Size = UDim2.new(0.68, 0, 0, 16),
		TextSize = 12,
		TextColor3 = Theme.accent,
		Text = string.format("Recompensa: %s XP · %s Beli", Ui.short(quest.xpReward), Ui.short(quest.beliReward)),
		Parent = card,
	})

	Ui.label({
		Position = UDim2.fromOffset(0, 58),
		Size = UDim2.new(0.68, 0, 0, 16),
		TextSize = 12,
		TextColor3 = quest.eligible and Theme.success or Theme.danger,
		Text = quest.eligible and "Disponível" or string.format("Requer nível %d", quest.levelReq),
		Parent = card,
	})

	local accept = Ui.button({
		AnchorPoint = Vector2.new(1, 0.5),
		Position = UDim2.new(1, 0, 0.5, 0),
		Size = UDim2.fromOffset(130, 34),
		Text = quest.eligible and "Aceitar" or "Bloqueada",
		BackgroundColor3 = quest.eligible and Theme.accent or Theme.panel,
		TextColor3 = quest.eligible and Color3.fromRGB(30, 25, 10) or Theme.textDim,
		Parent = card,
	})

	if quest.eligible then
		accept.MouseButton1Click:Connect(function()
			Net.event("AcceptQuest"):FireServer(quest.id)
			window.Visible = false
		end)
	end
end

local function onQuestOffer(giverName, quests)
	if not window then
		return
	end

	titleLabel.Text = giverName
	clearList()

	for order, quest in ipairs(quests) do
		buildQuestCard(quest, order)
	end

	window.Visible = true
end

function QuestController.start(screen)
	window = Ui.panel({
		Name = "QuestBoard",
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5),
		Size = UDim2.fromOffset(520, 340),
		BackgroundTransparency = 0.05,
		Visible = false,
		Parent = screen,
	})
	Ui.padding(window, 14)

	titleLabel = Ui.label({
		Size = UDim2.new(1, -40, 0, 24),
		Font = Enum.Font.GothamBold,
		TextSize = 18,
		Text = "Missões",
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
		window.Visible = false
	end)

	list = Ui.new("ScrollingFrame", {
		Position = UDim2.fromOffset(0, 36),
		Size = UDim2.new(1, 0, 1, -36),
		BackgroundTransparency = 1,
		BorderSizePixel = 0,
		ScrollBarThickness = 5,
		CanvasSize = UDim2.new(),
		AutomaticCanvasSize = Enum.AutomaticSize.Y,
		Parent = window,
	}, {
		Ui.new("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder }),
	})

	Net.event("QuestOffer").OnClientEvent:Connect(onQuestOffer)

	UserInputService.InputBegan:Connect(function(input, processedByGui)
		if processedByGui then
			return
		end
		if input.KeyCode == Enum.KeyCode.Escape and window.Visible then
			window.Visible = false
		end
	end)
end

return QuestController
