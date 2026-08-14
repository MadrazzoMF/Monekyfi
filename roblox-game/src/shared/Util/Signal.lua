--[[
	Signal
	Evento leve para comunicação entre services no servidor. Usar isto em vez de
	BindableEvent evita a serialização de argumentos que o BindableEvent faz
	(que quebra referências a tabelas).
]]

local Signal = {}
Signal.__index = Signal

local Connection = {}
Connection.__index = Connection

function Connection:Disconnect()
	if self._disconnected then
		return
	end
	self._disconnected = true

	local handlers = self._signal._handlers
	local index = table.find(handlers, self)
	if index then
		table.remove(handlers, index)
	end
end

function Signal.new()
	return setmetatable({ _handlers = {} }, Signal)
end

function Signal:Connect(callback)
	assert(type(callback) == "function", "Signal:Connect espera uma função")

	local connection = setmetatable({
		_signal = self,
		_callback = callback,
		_disconnected = false,
	}, Connection)

	table.insert(self._handlers, connection)
	return connection
end

function Signal:Fire(...)
	-- Copia a lista: um handler pode se desconectar (ou conectar outro)
	-- durante o disparo.
	local snapshot = table.clone(self._handlers)
	for _, connection in ipairs(snapshot) do
		if not connection._disconnected then
			-- task.spawn isola o erro: um handler que quebra não impede os
			-- outros de rodarem.
			task.spawn(connection._callback, ...)
		end
	end
end

function Signal:DisconnectAll()
	for _, connection in ipairs(table.clone(self._handlers)) do
		connection._disconnected = true
	end
	table.clear(self._handlers)
end

return Signal
