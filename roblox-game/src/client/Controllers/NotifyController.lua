--[[
	NotifyController
	Toasts no topo da tela. Kinds: "info", "success", "error".
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared.Net)

local Ui = require(script.Parent.Parent.Ui)

local NotifyController = {}

local Theme = Ui.Theme
local LIFETIME = 3.5
local MAX_VISIBLE = 5

local container = nil

local COLORS = {
	info = Theme.text,
	success = Theme.success,
	error = Theme.danger,
}

local function show(text, kind)
	if not container then
		return
	end

	-- Descarta os mais antigos: sem isto uma sequência de abates enche a tela.
	local existing = {}
	for _, child in ipairs(container:GetChildren()) do
		if child:IsA("Frame") then
			table.insert(existing, child)
		end
	end
	for index = 1, #existing - (MAX_VISIBLE - 1) do
		existing[index]:Destroy()
	end

	local toast = Ui.panel({
		Size = UDim2.new(1, 0, 0, 30),
		BackgroundTransparency = 0.15,
		Parent = container,
	})

	local label = Ui.label({
		Size = UDim2.fromScale(1, 1),
		Font = Enum.Font.GothamBold,
		TextSize = 13,
		TextXAlignment = Enum.TextXAlignment.Center,
		TextColor3 = COLORS[kind] or Theme.text,
		Text = tostring(text),
		TextWrapped = true,
		Parent = toast,
	})

	task.delay(LIFETIME, function()
		if not toast.Parent then
			return
		end
		local fade = TweenInfo.new(0.35)
		TweenService:Create(toast, fade, { BackgroundTransparency = 1 }):Play()
		TweenService:Create(label, fade, { TextTransparency = 1 }):Play()
		task.wait(0.4)
		toast:Destroy()
	end)
end

function NotifyController.start(screen)
	container = Ui.new("Frame", {
		Name = "Notifications",
		AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.new(0.5, 0, 0, 16),
		Size = UDim2.fromOffset(380, 200),
		BackgroundTransparency = 1,
		Parent = screen,
	}, {
		Ui.new("UIListLayout", {
			Padding = UDim.new(0, 6),
			SortOrder = Enum.SortOrder.LayoutOrder,
			HorizontalAlignment = Enum.HorizontalAlignment.Center,
		}),
	})

	Net.event("Notify").OnClientEvent:Connect(show)
end

return NotifyController
