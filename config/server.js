//-------------------------
//Constantes
//-------------------------
const port = 21047
//-------------------------
//Variáveis
//-------------------------
var lockOnUpdate = false
var countUpdateProcess = 0
//-------------------------
//Dependencias/Funções
//-------------------------
const bodyParser = require('body-parser')
const express = require('express')
const server = express();
const allowCors = require('../config/cors')
const queryparser = require('express-query-int')
const g = require('../api/general/generalfunc')


//-------------------------
//Middleware parser
//-------------------------
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json({ limit: '10mb' }))
server.use(allowCors)
server.use(queryparser())
//-------------------------
//Midleware
//-------------------------
server.use(function (req, res, next) {
	next()
})
//-------------------------
//Incia servidor
//-------------------------
server.listen(port, function () {
	g.log(`API rodando na porta: ${port}`)
})



module.exports = server
