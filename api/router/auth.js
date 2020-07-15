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
module.exports = router