--[[
	RigBuilder
	Monta personagens R6 inteiramente por código: nenhum modelo, mesh ou asset
	precisa existir no Studio. Usado pelos NPCs inimigos e pelos NPCs de missão.

	Os valores de C0/C1 abaixo são os offsets clássicos do rig R6 do Roblox.
	Mantê-los exatos é o que faz o Humanoid andar sem deslocar os membros.
]]

local RigBuilder = {}

local HALF_PI = math.pi / 2

local function makePart(name, size, color, parent)
	local part = Instance.new("Part")
	part.Name = name
	part.Size = size
	part.Color = color
	part.Material = Enum.Material.SmoothPlastic
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.LeftSurface = Enum.SurfaceType.Smooth
	part.RightSurface = Enum.SurfaceType.Smooth
	part.FrontSurface = Enum.SurfaceType.Smooth
	part.BackSurface = Enum.SurfaceType.Smooth
	part.Parent = parent
	return part
end

local function makeMotor(name, part0, part1, c0, c1)
	local motor = Instance.new("Motor6D")
	motor.Name = name
	motor.Part0 = part0
	motor.Part1 = part1
	motor.C0 = c0
	motor.C1 = c1
	motor.Parent = part0
	return motor
end

--[[
	options:
		name        string
		bodyColor   Color3   (cabeça, braços, pernas)
		shirtColor  Color3   (torso)
		scale       number   (1 = tamanho padrão R6)
		maxHealth   number
		walkSpeed   number
		anchored    boolean  (NPCs de missão ficam parados)

	Retorna: model, humanoid
]]
function RigBuilder.build(options)
	local scale = options.scale or 1
	local bodyColor = options.bodyColor or Color3.fromRGB(215, 180, 150)
	local shirtColor = options.shirtColor or Color3.fromRGB(70, 90, 130)

	-- Offset posicional escalado; a rotação nunca escala.
	local function offset(x, y, z, rotation)
		local base = CFrame.new(x * scale, y * scale, z * scale)
		return rotation and (base * rotation) or base
	end

	local model = Instance.new("Model")
	model.Name = options.name or "Npc"

	local torso = makePart("Torso", Vector3.new(2, 2, 1) * scale, shirtColor, model)
	local root = makePart("HumanoidRootPart", Vector3.new(2, 2, 1) * scale, shirtColor, model)
	root.Transparency = 1
	root.CanCollide = false

	local head = makePart("Head", Vector3.new(2, 1, 1) * scale, bodyColor, model)
	local rightArm = makePart("Right Arm", Vector3.new(1, 2, 1) * scale, bodyColor, model)
	local leftArm = makePart("Left Arm", Vector3.new(1, 2, 1) * scale, bodyColor, model)
	local rightLeg = makePart("Right Leg", Vector3.new(1, 2, 1) * scale, bodyColor, model)
	local leftLeg = makePart("Left Leg", Vector3.new(1, 2, 1) * scale, bodyColor, model)

	-- Posiciona tudo relativo ao torso na origem antes de criar as juntas,
	-- para que a física não precise corrigir nada no primeiro frame.
	torso.CFrame = CFrame.new(0, 0, 0)
	root.CFrame = CFrame.new(0, 0, 0)
	head.CFrame = offset(0, 1.5, 0)
	rightArm.CFrame = offset(1.5, 0, 0)
	leftArm.CFrame = offset(-1.5, 0, 0)
	rightLeg.CFrame = offset(0.5, -2, 0)
	leftLeg.CFrame = offset(-0.5, -2, 0)

	local flipped = CFrame.fromEulerAnglesXYZ(-HALF_PI, 0, math.pi)
	local turnRight = CFrame.fromEulerAnglesXYZ(0, HALF_PI, 0)
	local turnLeft = CFrame.fromEulerAnglesXYZ(0, -HALF_PI, 0)

	makeMotor("RootJoint", root, torso, flipped, flipped)
	makeMotor("Neck", torso, head, offset(0, 1, 0, flipped), offset(0, -0.5, 0, flipped))
	makeMotor("Right Shoulder", torso, rightArm, offset(1, 0.5, 0, turnRight), offset(-0.5, 0.5, 0, turnRight))
	makeMotor("Left Shoulder", torso, leftArm, offset(-1, 0.5, 0, turnLeft), offset(0.5, 0.5, 0, turnLeft))
	makeMotor("Right Hip", torso, rightLeg, offset(1, -1, 0, turnRight), offset(0.5, 1, 0, turnRight))
	makeMotor("Left Hip", torso, leftLeg, offset(-1, -1, 0, turnLeft), offset(-0.5, 1, 0, turnLeft))

	local humanoid = Instance.new("Humanoid")
	humanoid.RigType = Enum.HumanoidRigType.R6
	humanoid.MaxHealth = options.maxHealth or 100
	humanoid.Health = humanoid.MaxHealth
	humanoid.WalkSpeed = options.walkSpeed or 12
	humanoid.NameDisplayDistance = 0
	humanoid.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOff
	humanoid.Parent = model

	model.PrimaryPart = root

	if options.anchored then
		for _, descendant in ipairs(model:GetDescendants()) do
			if descendant:IsA("BasePart") then
				descendant.Anchored = true
			end
		end
	end

	return model, humanoid
end

-- Coloca o rig com os pés em `groundPosition`. O centro do root fica 3 studs
-- acima do chão num rig de escala 1.
function RigBuilder.placeOnGround(model, groundPosition, scale, lookDirection)
	local pivot = CFrame.new(groundPosition + Vector3.new(0, 3 * (scale or 1), 0))

	if lookDirection and lookDirection.Magnitude > 0.01 then
		local flat = Vector3.new(lookDirection.X, 0, lookDirection.Z)
		if flat.Magnitude > 0.01 then
			pivot = CFrame.lookAt(pivot.Position, pivot.Position + flat.Unit)
		end
	end

	model:PivotTo(pivot)
end

--[[
	Placa de nome com barra de vida desenhada por código.
	`subtitle` aparece abaixo do nome (ex.: "Nível 5" ou "Instrutor").
]]
function RigBuilder.attachNameplate(model, humanoid, title, subtitle, titleColor)
	local head = model:FindFirstChild("Head")
	if not head then
		return
	end

	local billboard = Instance.new("BillboardGui")
	billboard.Name = "Nameplate"
	billboard.Size = UDim2.fromScale(9, 2.6)
	billboard.StudsOffsetWorldSpace = Vector3.new(0, 2.2, 0)
	billboard.AlwaysOnTop = false
	billboard.MaxDistance = 220
	billboard.Parent = head

	local nameLabel = Instance.new("TextLabel")
	nameLabel.BackgroundTransparency = 1
	nameLabel.Size = UDim2.new(1, 0, 0.42, 0)
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.TextScaled = true
	nameLabel.Text = title
	nameLabel.TextColor3 = titleColor or Color3.fromRGB(255, 255, 255)
	nameLabel.TextStrokeTransparency = 0.4
	nameLabel.Parent = billboard

	local subtitleLabel = Instance.new("TextLabel")
	subtitleLabel.BackgroundTransparency = 1
	subtitleLabel.Position = UDim2.new(0, 0, 0.42, 0)
	subtitleLabel.Size = UDim2.new(1, 0, 0.3, 0)
	subtitleLabel.Font = Enum.Font.Gotham
	subtitleLabel.TextScaled = true
	subtitleLabel.Text = subtitle or ""
	subtitleLabel.TextColor3 = Color3.fromRGB(215, 215, 225)
	subtitleLabel.TextStrokeTransparency = 0.6
	subtitleLabel.Parent = billboard

	-- Só inimigos precisam de barra de vida.
	if humanoid.MaxHealth <= 0 or model:GetAttribute("NoHealthBar") then
		return
	end

	local barBack = Instance.new("Frame")
	barBack.Name = "HealthBack"
	barBack.AnchorPoint = Vector2.new(0.5, 0)
	barBack.Position = UDim2.new(0.5, 0, 0.76, 0)
	barBack.Size = UDim2.new(0.72, 0, 0.16, 0)
	barBack.BackgroundColor3 = Color3.fromRGB(25, 25, 30)
	barBack.BorderSizePixel = 0
	barBack.Parent = billboard

	local barFill = Instance.new("Frame")
	barFill.Name = "HealthFill"
	barFill.Size = UDim2.fromScale(1, 1)
	barFill.BackgroundColor3 = Color3.fromRGB(90, 210, 110)
	barFill.BorderSizePixel = 0
	barFill.Parent = barBack

	local function refresh()
		local ratio = 0
		if humanoid.MaxHealth > 0 then
			ratio = math.clamp(humanoid.Health / humanoid.MaxHealth, 0, 1)
		end
		barFill.Size = UDim2.fromScale(ratio, 1)
		barFill.BackgroundColor3 = ratio > 0.5 and Color3.fromRGB(90, 210, 110)
			or ratio > 0.25 and Color3.fromRGB(235, 190, 70)
			or Color3.fromRGB(225, 75, 70)
	end

	humanoid.HealthChanged:Connect(refresh)
	refresh()
end

return RigBuilder
