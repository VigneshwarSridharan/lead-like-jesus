const express = require('express');
const { User } = require('../modal/bookshelf')
const { parseResponse } = require('../util')
const router = express.Router();

router.post('/login', (req, res) => {
    res.send('fgfdg')
})

router.get('/test', (req, res) => {

    User.collection().fetch({ debug: true }).then(user => {
        res.send(user)
    })
    // User.forge({
    //     username:'malathi@gmail.com',
    //     password:'password',
    //     role:1
    // }).save().then(result => {
    //     res.send(result)
    // })
})

router.post('/adduser', (req, res) => {
    User.forge(req.body).save().then(result => {
        // res.json({status})
        parseResponse(res, null, result)
    }).catch(err => {
        parseResponse(res, err)
    })
})
router.get('/userlist', (req, res) => {
    User.fetchAll({ debug: true }).then(users => {
        parseResponse(res, null, users)
    }).catch(err => {
        parseResponse(res, err)
    })
})
router.get('/user/:id', (req, res) => {
    User.where({ id: req.params.id }).fetch({ debug: true }).then(user => {
        parseResponse(res, null, user)
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.post('/user/:id', (req, res) => {
    User.forge({ id: req.params.id }).save({ ...req.body }).then(user => {
        parseResponse(res, null, user)
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.delete('/user/:id', (req, res) => {
    new User({ id: req.params.id }).destroy().then(user => {
        parseResponse(res, null, user)
    }).catch(err => {
        parseResponse(res, err)
    })

})


module.exports = router