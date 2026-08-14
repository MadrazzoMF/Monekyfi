--[[
	DamageController
	Números de dano flutuantes. Criados só no cliente que precisa vê-los —
	o servidor manda o evento apenas para o atacante e para quem levou o dano.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared.Net)

local Ui = require(script.Parent.Parent.Ui)

local DamageController = {}

local RISE_TIME = 0.9
local RISE_HEIGHT = 7

local function spawnNumber(position, amount, incoming)
	-- Uma part invisível serve de âncora para o BillboardGui. Existe apenas
	-- neste cliente, então não gera tráfego de rede.
	local anchor = Instance.new("Part")
	anchor.Anchored = true
	anchor.CanCollide = false
	anchor.CanQuery = false
	anchor.CanTouch = false
	anchor.Transparency = 1
	anchor.Size = Vector3.new(0.2, 0.2, 0.2)
	anchor.CFrame = CFrame.new(position + Vector3.new(math.random(-15, 15) / 10, 0, 0))
	anchor.Parent = Workspace

	local billboard = Ui.new("BillboardGui", {
		Size = UDim2.fromScale(6, 2),
		AlwaysOnTop = true,
		MaxDistance = 180,
		Parent = anchor,
	})

	local label = Ui.label({
		Size = UDim2.fromScale(1, 1),
		Font = Enum.Font.GothamBlack,
		TextScaled = true,
		TextXAlignment = Enum.TextXAlignment.Center,
		TextColor3 = incoming and Ui.Theme.danger or Ui.Theme.accent,
		TextStrokeTransparency = 0.2,
		Text = tostring(math.floor(amount)),
		Parent = billboard,
	})

	local tweenInfo = TweenInfo.new(RISE_TIME, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	TweenService:Create(anchor, tweenInfo, { CFrame = anchor.CFrame + Vector3.new(0, RISE_HEIGHT, 0) }):Play()
	TweenService:Create(label, tweenInfo, { TextTransparency = 1, TextStrokeTransparency = 1 }):Play()

	task.delay(RISE_TIME + 0.1, function()
		anchor:Destroy()
	end)
end

function DamageController.start()
	Net.event("Damage").OnClientEvent:Connect(spawnNumber)
end

return DamageController
