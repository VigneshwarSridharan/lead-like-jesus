var express = require('express')
const { MailConfig } = require('../modal/bookshelf')
var router = express.Router()


router.get('/', async (req, res, next) => {
    try {
        let result = await MailConfig.fetchAll()
        res.send({ data: result })

    }
    catch (err) {
        console.log(err)
        res.send({
            status: 0,
            error: err.toString()
        })
    }
})
router.get('/:id', async (req, res, next) => {
    try {
        let result = await MailConfig.where({ id: req.params.id }).fetch()
        res.send({ data: result })

    }
    catch (err) {
        console.log(err)
        res.send({
            status: 0,
            error: err.toString()
        })
    }
})
router.put('/:id', async (req, res, next) => {
    try {
        console.log(req.params.id, req.body)
        let result = await MailConfig.where({ id: req.params.id }).save(req.body, { method: 'update', patch: true })
        res.send({ status: 1, data: result })

    }
    catch (err) {
        console.log(err)
        res.send({
            status: 0,
            error: err.toString()
        })
    }
})


module.exports = router