const { find, clone } = require("lodash")
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

const createReserva = (req, res, next) => {
    const dados = req.body

    if (dados.bloco && dados.sala && dados.dataHoraInicio && dados.dataHoraFinal && dados.professor && dados.motivo) {

        findDados("bloco", { _id: mongoClient.ObjectID(dados.bloco) }, (blocoR, err) => {
            const bloco = blocoR[0]

            findDados("sala", { _id: mongoClient.ObjectID(dados.sala) }, (salaR, err) => {
                const sala = salaR[0]

                if (bloco._id == sala.bloco) {

                    let dataInicioMoment = moment(dados.dataHoraInicio, formatBr)
                    let dataFinalMoment = moment(dados.dataHoraFinal, formatBr)

                    let dataInicio = parseInt(dataInicioMoment.format(formatCon))
                    let dataFinal = parseInt(dataFinalMoment.format(formatCon))

                    if (dataInicio >= dataFinal) {
                        return res.status(404).send("Erro: Data inicio é maior ou igual a data final")
                    } else if (dataFinalMoment.diff(dataInicioMoment, "minutes") < 30) {
                        return res.status(404).send("Erro: Para Realizar uma reserva ela tem que ter no minimo 30 minutos")
                    }

                    let or = []
                    let datasRecorrencia = []

                    if (dados.recorrencia) {
                        const periodo = periodoDeRecorrencia[dados.periodo];
                        const dataPeriodoFinal = moment(dados.dataFinalPeriodo, formatBr).format(formatConSH)
                        let dataInicioConsulta = moment(dataInicio, formatCon).format(formatConSH)

                        let dataInicioRecorrencia = cloneDados(dataInicio)
                        let dataFinalRecorrencia = cloneDados(dataFinal)

                        while (dataInicioConsulta <= dataPeriodoFinal) {
                            datasRecorrencia.push({ dataInicio: dataInicioRecorrencia, dataFinal: dataFinalRecorrencia })
                            or = gerarData(or, dataInicioRecorrencia, dataFinalRecorrencia)

                            dataInicioConsulta = moment(dataInicioConsulta, formatCon).add(periodo.dias, periodo.metodo).format(formatConSH)

                            dataInicioRecorrencia = parseInt(moment(dataInicioRecorrencia, formatCon).add(periodo.dias, periodo.metodo).format(formatCon))
                            dataFinalRecorrencia = parseInt(moment(dataFinalRecorrencia, formatCon).add(periodo.dias, periodo.metodo).format(formatCon))
                        }
                    } else {
                        or = gerarData(or, dataInicio, dataFinal)
                    }


                    const filterData = {
                        $or: or
                    }

                    findDados("reservas", filterData, (resp, err) => {
                        if (resp.length == 0) {

                            let data = []

                            if (dados.recorrencia) {

                                datasRecorrencia.forEach((e, i) => {
                                    data.push({
                                        bloco: bloco._id,
                                        sala: sala._id,
                                        dataInicio: e.dataInicio,
                                        dataFinal: e.dataFinal,
                                        nomeProfessor: dados.professor,
                                        motivo: dados.motivo
                                    })
                                })

                            } else {
                                data = {
                                    bloco: bloco._id,
                                    sala: sala._id,
                                    dataInicio: dataInicio,
                                    dataFinal: dataFinal,
                                    nomeProfessor: dados.professor,
                                    motivo: dados.motivo
                                }
                            }


                            mongodb.getConn().collection("reservas").insert(data).then((resp) => {
                                res.status(200).send("Sucesso ao inserir")
                            }).catch((err) => {
                                console.log(err)
                                res.status(400).send("Erro ao inserir")
                            })
                        } else {
                            res.status(404).send("ja tem reserva neste horario")
                        }
                    })

                }

            })

        })

    } else[
        res.status(404).send("Não foi encontrado todos os campos necessarios")
    ]
}

const getReserva = (req, res, next) => {
    const parametro = req.params.id
    let filter = {}

    if (parametro) {
        filter = { _id: mongoClient.ObjectID(parametro) }
    }

    findDados("reservas", filter, (resp, err) => {
        if (err) { return res.status(404).send("Erro ao Buscar!") }

        resp.forEach((e, i) => {
            resp[i].dataInicio = moment(e.dataInicio, formatCon).format(formatBr)
            resp[i].dataFinal = moment(e.dataFinal, formatCon).format(formatBr)
        });

        return res.status(200).send(resp)
    })
}

const getDisponibilidade = (req, res, next) => {
    const dados = req.body

    if (dados.dataHoraInicio && dados.dataHoraFinal) {

        let dataInicioMoment = moment(dados.dataHoraInicio, formatBr)
        let dataFinalMoment = moment(dados.dataHoraFinal, formatBr)

        let dataInicio = parseInt(dataInicioMoment.format(formatCon))
        let dataFinal = parseInt(dataFinalMoment.format(formatCon))

        let or = gerarData([], dataInicio, dataFinal)

        const filterData = {
            $or: or
        }

        if (dataInicio >= dataFinal) {
            return res.status(404).send("Erro: Data inicio é maior ou igual a data final")
        }

        findDados("reservas", filterData, (resp, err) => {
            if (err) { return res.status(404).send("Erro ao Buscar!") }

            resp.forEach((e, i) => {
                resp[i].dataInicio = moment(e.dataInicio, formatCon).format(formatBr)
                resp[i].dataFinal = moment(e.dataFinal, formatCon).format(formatBr)
            });

            return res.status(200).send(resp)
        })

    } else[
        res.status(404).send("Não foi encontrado todos os campos necessarios")
    ]
}

const cancelarReserva = (req, res, next) => {

    const parametro = req.params.id
    const filter = { _id: mongoClient.ObjectID(parametro) }

    mongodb.getConn().collection("reservas").deleteMany(filter).then((response) => {
        res.status(200).send("Cancelado ao remover")
    }).catch((err) => {
        res.status(400).send(err)
    })

}

const cloneDados = (data) => {
    return JSON.parse(JSON.stringify(data))
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

module.exports = {
    createReserva,
    getReserva,
    getDisponibilidade,
    cancelarReserva
}