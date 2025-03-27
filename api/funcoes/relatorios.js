const mongodb = require("../../config/mongodb")
const mongoClient = require("mongodb")
const moment = require("moment")

const periodoDeRecorrencia = {
    "diario": { dias: 1, metodo: "day" },
    "semanal": { dias: 7, metodo: "day" },
    "mensal": { dias: 1, metodo: "months" },
}
const formatBr = "DD/MM/YYYY HH:mm:ss"
const formatCon = "YYYYMMDDHHmmss"
const formatConSH = "YYYYMMDD"
const formatH = "HHmmss"

const relatorios = async (req, res, next) => {

    const collection = "reservas"
    const dados = req.body

    if (dados.periodo && dados.data) {
        console.log("\n")
        console.log("====================================================================================")
        await maisReserva(collection, dados)
        await horarioPico(collection, dados)
        await taxaReserva(collection, dados)
    }

}

const maisReserva = (collection, dados) => {

    const periodo = periodoDeRecorrencia[dados.periodo]
    const dI = parseInt(moment(dados.data, formatBr).add(-periodo.dias, periodo.metodo).format(formatConSH)+"000000")
    const dF = parseInt(moment(dados.data, formatBr).add(1, "day").format(formatConSH)+"000000")

    const or = gerarData([], dI, dF)
    const filterData = {
        $or: or
    }

    const reservado = {}

    findDados(collection, filterData, (resp, err) => {
        if (err) console.log("erro")
        if (resp) {
            resp.forEach((e, i) => {
                if (!reservado[e.sala]) reservado[e.sala] = {idSala: e.sala, count: 0}

                reservado[e.sala].count++
            });

            const countSala = Object.values(reservado)

            countSala.sort((a, b)=>{
                if (a.count < b.count) return 1
                if (a.count > b.count) return -1
                return 0
            })
            
            const sala = countSala[0].idSala
            const filterId = {_id: mongoClient.ObjectID(sala)}

            findDados("sala", filterId, (data, err) => {
                console.log(`A sala mais requisitada durante o periodo foi a ${data[0].nome}`)
            })
        }
    })

}

const horarioPico = (collection, dados) => {
    const periodo = periodoDeRecorrencia[dados.periodo]
    const dI = parseInt(moment(dados.data, formatBr).add(-periodo.dias, periodo.metodo).format(formatConSH)+"000000")
    const dF = parseInt(moment(dados.data, formatBr).add(1, "day").format(formatConSH)+"000000")

    const or = gerarData([], dI, dF)
    const filterData = {
        $or: or
    }

    const reservado = {}

    findDados(collection, filterData, (resp, err) => {
        if (err) console.log("erro")
        if (resp) {
            resp.forEach((e, i) => {
                let horaInicio = moment(e.dataInicio, formatCon).format("HH:mm:ss")
                let horaFinal = moment(e.dataFinal, formatCon).format("HH:mm:ss")
                let data = horaInicio + "" + horaFinal
                if (!reservado[data]) reservado[data] = {idSala: e.sala, horaInicio, horaFinal, count: 0}

                reservado[data].count++
            });

            const countSala = Object.values(reservado)

            countSala.sort((a, b)=>{
                if (a.count < b.count) return 1
                if (a.count > b.count) return -1
                return 0
            })
            
            const sala = countSala[0]
            const filterId = {_id: mongoClient.ObjectID(sala.idSala)}

            findDados("sala", filterId, (data, err) => {
                console.log(`A sala mais requisitada foi a ${data[0].nome}, no horario ${sala.horaInicio} às ${sala.horaFinal}`)
            })
        }
    })
}

const taxaReserva = (collection, dados) => {
    const periodo = periodoDeRecorrencia[dados.periodo]
    const dI = parseInt(moment(dados.data, formatBr).add(-periodo.dias, periodo.metodo).format(formatConSH)+"000000")
    const dF = parseInt(moment(dados.data, formatBr).add(1, "day").format(formatConSH)+"000000")

    const or = gerarData([], dI, dF)
    const filterData = {
        $or: or
    }

    let reservado = {}

    findDados(collection, filterData, (resp, err) => {
        if (err) console.log("erro")
        if (resp) {
            resp.forEach((e, i) => {
                if (!reservado[e.sala]) reservado[e.sala] = {idSala: e.sala, count: 0}

                reservado[e.sala].count++
            });

            let count = 0
            let totalRegistro = 0
            let filterId

            reservado = Object.values(reservado)
            reservado.forEach((e, i) => {
                
                filterId = {_id: mongoClient.ObjectID(e.idSala)}
                findDados("sala", filterId, (data, err) => {
                    reservado[i].sala = data[0]
                    totalRegistro += reservado[i].count
                    count++
                    if (reservado.length == count) {
                        sendMsgTaxaReserva(reservado, totalRegistro)
                    }
                })
            })

        }
    })
}

const sendMsgTaxaReserva = (salas, total) => {

    const totalRegistro = total 
    let msg = "", porcento
    salas.forEach((e, i) => {
        porcento = (e.count/totalRegistro) * 100
        msg += `A sala ${e.sala.nome} teve ${porcento}% de reserva`
    })
    console.log(msg)
}

const gerarData = (or, dataInicio, dataFinal) => {
    or.push({ dataInicio: { $gte: dataInicio, $lt: dataFinal } })
    or.push({ dataFinal: { $gte: dataInicio, $lt: dataFinal } })
    return or
}

const findDados = (collection, filter, callback) => {
    mongodb.getConn().collection(collection).find(filter).toArray().then((response) => {
        callback(response, null)
    }).catch((err) => {
        console.log(err)
        callback(null, err)
    })
}


module.exports = {
    relatorios,
}