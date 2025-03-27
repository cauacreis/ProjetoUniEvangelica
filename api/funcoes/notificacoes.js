const cron = require("node-cron")
const mongoClient = require("mongodb")
const mongodb = require("../../config/mongodb")
const moment = require("moment")

const formatBr = "DD/MM/YYYY HH:mm:ss"
const formatCon = "YYYYMMDDHHmmss"
const formatConSH = "YYYYMMDD"

const notificacao = () => {

    cron.schedule("* 07 * * 1-5", () => {
        let dataInicio = parseInt(moment().format(formatConSH) + "000000")
        let dataFim = parseInt(moment().add(1, "day").format(formatConSH) + "000000")
        const or = gerarData([], dataInicio, dataFim)

        const filterData = {
            $or: or
        }

        findDados("reservas", filterData, async (resp, err) => {

            if (err) return console.log("erro na busca")

            let filter

            let msg = ""
            findSala(resp, (result) => {

                result.forEach((e, i) => {
                    let dI = moment(e.dataInicio, formatCon).format(formatBr)
                    let dF = moment(e.dataFinal, formatCon).format(formatBr)
                    msg += `O professor ${e.nomeProfessor} reservou a sala ${e.sala} nos horarios ${dI} até ${dF}\n`
                })

                console.log(msg)

            })

        })

    })

}

const gerarData = (or, dataInicio, dataFinal) => {
    or.push({ dataInicio: { $gt: dataInicio, $lte: dataFinal } })
    or.push({ dataFinal: { $gt: dataInicio, $lte: dataFinal } })
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

const findSala = (resp, callback) => {
    resp.forEach((e, i) => {
        filter = { _id: mongoClient.ObjectID(e.sala) }
        findMultiplo("sala", filter, i, (data, index) => {
            resp[index].sala = data[0].nome
            if (resp.length - 1 == index) {
                callback(resp)
            }
        })
    });
}

const findMultiplo = (collection, filter, i, callback) => {

    findDados(collection, filter, (data) => {
        callback(data, i)
    })

}



module.exports = notificacao