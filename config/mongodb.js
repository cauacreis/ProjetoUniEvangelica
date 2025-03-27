
const mongoClient = require("mongodb").MongoClient;
const debug = require('../api/general/generalfunc')
var connection 

//======================================================
//Dados de conexão  mongoDB
//======================================================
// Localhost
const mongoData =  {
    url: 'mongodb://0.0.0.0',
    database:'atividade'
}

//======================================================
//Conecta no banco
//======================================================
function connect (){
	mongoClient.connect(mongoData.url, { useUnifiedTopology: true }).then(function(conn){
		connection = conn.db(mongoData.database)
		//const verifyDeviceStatus = require('../api/hidrometers/verifiyStatus')
	}).catch(function(err){
		console.log(err)
	})
}
connect()
//======================================================
//Disponibiliza conexão
//======================================================
function getConn(){
	return connection
}


debug.log(`driver mongodb direcionada para : ${mongoData.url}`)
debug.log(`driver mongodb Database : ${mongoData.database}`)

module.exports = {getConn}
