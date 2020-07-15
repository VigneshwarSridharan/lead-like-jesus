const express = require('express');
const { User } = require('../modal/bookshelf')

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

module.exports = router