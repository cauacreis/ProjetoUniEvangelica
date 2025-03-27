const { filter } = require("lodash")
const mongodb = require("../../config/mongodb")
const mongoClient = require("mongodb")

const rota = (req, res, next) => {
    switch (req.method) {
        case "GET":
            return list(req, res)
        case "POST":
            return create(req, res)
        case "PUT":
            return update(req, res)
        case "DELETE":
            return del(req, res)
        default:
            return rest.status(404).send("Não foi possível encontrar este método de requisição")
    }
}

const create = (req, res) => {
    const dados = req.body
    if (dados.nome && dados.identificacao) {
        mongodb.getConn().collection("bloco").insertOne(dados).then((response) => {
            res.status(200).send("Sucesso ao inserir")
        }).catch((err) => {
            res.status(400).send(err.message)
        })
    } else {
        res.status(404).send("Não foi encontrado todos os campos necessarios")
    }

}

const update = (req, res) => {
    const parametro = req.url.replace("/", "")

    if (parametro != "") {
        const filter = { _id: mongoClient.ObjectID(parametro) }
        const dados = req.body

        mongodb.getConn().collection("bloco").updateOne(filter, { $set: dados }).then((response) => {
            res.status(200).send("Sucesso ao alterar")
        }).catch((err) => {
            res.status(400).send(err.message)
        })
    } else {
        res.status(404).send("Não tem id")
    }
}

const list = (req, res) => {
    const parametro = req.url.replace("/", "")
    let filter = {}

    if (parametro != "") {
        filter = { _id: mongoClient.ObjectID(parametro) }
    }

    mongodb.getConn().collection("bloco").find(filter).toArray().then((response) => {
        res.status(200).send(response)
    }).catch((err) => {
        res.status(400).send(err)
    })
}

const del = (req, res) => {
    const parametro = req.url.replace("/", "")

    if (parametro != "") {
        const filter = { _id: mongoClient.ObjectID(parametro) }

        mongodb.getConn().collection("bloco").deleteMany(filter).then((response) => {
            res.status(200).send("Sucesso ao remover")
        }).catch((err) => {
            res.status(400).send(err.message)
        })
    } else {
        res.status(404).send("Não tem id")
    }
}

module.exports = {
    rota,
    create,
    update,
    list,
    del,
}