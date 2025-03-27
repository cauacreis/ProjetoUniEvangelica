const express = require('express')
const mongoDB = require('../api/mongoDB/mongoHTTP')
const bloco = require("../api/funcoes/bloco")
const sala = require ("../api/funcoes/sala")
const reserva = require("../api/funcoes/reserva")
const notificacao = require("../api/funcoes/notificacoes")
const relatorios = require("../api/funcoes/relatorios")

module.exports = function (server) {
	
	server.use("/bloco", bloco.rota)
	server.use("/sala", sala.rota)
	server.post("/relatorios", relatorios.relatorios)

	server.post("/reserva", reserva.createReserva)
	server.get("/reserva/:id?", reserva.getReserva)
	server.post("/disponibilidade", reserva.getDisponibilidade)
	server.delete("/reserva/:id", reserva.cancelarReserva)

	notificacao()
	
}

