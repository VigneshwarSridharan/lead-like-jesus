const express = require('express');
const { Event } = require('../modal/bookshelf')
const { parseResponse } = require('../util')
const router = express.Router();



router.get('/eventlist', (req, res) => {
    Event.fetchAll({ debug: true }).then(users => {
        parseResponse(res, null, users)
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.post('/addevent', (req, res) => {     //insert data
    Event.forge(req.body).save().then(result => {
        // res.json({status})
        parseResponse(res, null, result)
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.get('/event/:id', (req, res) => {    //edit data
    Event.where({ id: req.params.id }).fetch({ debug: true }).then(user => {
        parseResponse(res, null, user)
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.post('/event/:id', (req, res) => {  //update and save
    console.log("sfgdfdddddddd")
    Event.forge({ id: req.params.id }).save({ ...req.body }).then(user => {
        parseResponse(res, null, user)
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.delete('/event/:id', (req, res) => {
    new Event({ id: req.params.id }).destroy().then(user => {
        parseResponse(res, null, user)
    }).catch(err => {
        parseResponse(res, err)
    })

})

module.exports = router