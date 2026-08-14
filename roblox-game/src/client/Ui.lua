--[[
	Ui
	Helper mínimo para montar interface por código, e a paleta do jogo.
	Toda a UI é criada em runtime — nenhum ScreenGui precisa existir no Studio.
]]

local Ui = {}

Ui.Theme = {
	panel = Color3.fromRGB(22, 24, 32),
	panelLight = Color3.fromRGB(34, 37, 48),
	stroke = Color3.fromRGB(58, 63, 80),
	text = Color3.fromRGB(240, 242, 248),
	textDim = Color3.fromRGB(160, 166, 184),
	accent = Color3.fromRGB(255, 186, 70),
	xp = Color3.fromRGB(120, 175, 255),
	health = Color3.fromRGB(90, 210, 110),
	danger = Color3.fromRGB(230, 80, 75),
	success = Color3.fromRGB(105, 215, 130),
	beli = Color3.fromRGB(255, 214, 110),
}

--[[
	Ui.new("Frame", { Size = ..., Parent = ... }, { children })
	Parent é aplicado por último, para a instância ser montada já pronta.
]]
function Ui.new(className, props, children)
	local instance = Instance.new(className)
	local parent = nil

	for key, value in pairs(props or {}) do
		if key == "Parent" then
			parent = value
		else
			instance[key] = value
		end
	end

	for _, child in ipairs(children or {}) do
		child.Parent = instance
	end

	if parent then
		instance.Parent = parent
	end

	return instance
end

function Ui.corner(parent, radius)
	return Ui.new("UICorner", { CornerRadius = UDim.new(0, radius or 8), Parent = parent })
end

function Ui.stroke(parent, color, thickness)
	return Ui.new("UIStroke", {
		Color = color or Ui.Theme.stroke,
		Thickness = thickness or 1,
		Parent = parent,
	})
end

function Ui.padding(parent, pixels)
	return Ui.new("UIPadding", {
		PaddingTop = UDim.new(0, pixels),
		PaddingBottom = UDim.new(0, pixels),
		PaddingLeft = UDim.new(0, pixels),
		PaddingRight = UDim.new(0, pixels),
		Parent = parent,
	})
end

function Ui.panel(props, children)
	local frame = Ui.new("Frame", props, children)
	frame.BackgroundColor3 = props.BackgroundColor3 or Ui.Theme.panel
	frame.BorderSizePixel = 0
	Ui.corner(frame, 10)
	Ui.stroke(frame)
	return frame
end

function Ui.label(props)
	local defaults = {
		BackgroundTransparency = 1,
		Font = Enum.Font.Gotham,
		TextColor3 = Ui.Theme.text,
		TextSize = 14,
		TextXAlignment = Enum.TextXAlignment.Left,
	}
	for key, value in pairs(props) do
		defaults[key] = value
	end
	return Ui.new("TextLabel", defaults)
end

function Ui.button(props)
	local defaults = {
		BackgroundColor3 = Ui.Theme.panelLight,
		BorderSizePixel = 0,
		Font = Enum.Font.GothamBold,
		TextColor3 = Ui.Theme.text,
		TextSize = 14,
		AutoButtonColor = true,
	}
	for key, value in pairs(props) do
		defaults[key] = value
	end

	local button = Ui.new("TextButton", defaults)
	Ui.corner(button, 6)
	Ui.stroke(button)
	return button
end

-- Barra de progresso: retorna o Frame externo e o Frame de preenchimento.
function Ui.bar(props, fillColor)
	local back = Ui.new("Frame", props)
	back.BackgroundColor3 = Color3.fromRGB(14, 15, 20)
	back.BorderSizePixel = 0
	Ui.corner(back, 6)

	local fill = Ui.new("Frame", {
		Size = UDim2.fromScale(0, 1),
		BackgroundColor3 = fillColor,
		BorderSizePixel = 0,
		Parent = back,
	})
	Ui.corner(fill, 6)

	return back, fill
end

-- 12345 -> "12.3k". Números de Beli e XP ficam ilegíveis sem isto.
function Ui.short(value)
	value = math.floor(value or 0)
	if value >= 1000000000 then
		return string.format("%.2fB", value / 1000000000)
	elseif value >= 1000000 then
		return string.format("%.2fM", value / 1000000)
	elseif value >= 10000 then
		return string.format("%.1fk", value / 1000)
	end
	return tostring(value)
end

return Ui
