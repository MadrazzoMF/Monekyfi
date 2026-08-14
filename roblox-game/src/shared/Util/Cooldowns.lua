--[[
	Cooldowns
	Controle de cooldown por (dono, chave). Usado no servidor para validar
	ataques e no cliente para escurecer os ícones de golpe.

	O servidor é a autoridade: o cliente também mantém um Cooldowns só para
	feedback visual, mas quem rejeita spam é o servidor.
]]

local Cooldowns = {}
Cooldowns.__index = Cooldowns

function Cooldowns.new()
	return setmetatable({ _expiry = {} }, Cooldowns)
end

local function bucket(self, owner)
	local owned = self._expiry[owner]
	if not owned then
		owned = {}
		self._expiry[owner] = owned
	end
	return owned
end

function Cooldowns:isReady(owner, key, tolerance)
	local expiry = bucket(self, owner)[key]
	if not expiry then
		return true
	end
	return os.clock() >= (expiry - (tolerance or 0))
end

function Cooldowns:start(owner, key, duration)
	bucket(self, owner)[key] = os.clock() + duration
end

function Cooldowns:remaining(owner, key)
	local expiry = bucket(self, owner)[key]
	if not expiry then
		return 0
	end
	return math.max(0, expiry - os.clock())
end

function Cooldowns:clear(owner)
	self._expiry[owner] = nil
end

return Cooldowns
