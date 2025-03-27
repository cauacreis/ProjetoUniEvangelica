function log(msg){
	console.log(`Debug: ${msg}`)
}


function error(msg) {
	console.error(`Error: ${msg}`)
}

module.exports =  {
	log,
	error,
}