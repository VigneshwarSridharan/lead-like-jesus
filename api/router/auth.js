const express = require('express');
const CryptoJS = require('crypto-js');
const { User } = require('../modal/bookshelf')
const { parseResponse } = require('../util')
const { createJWToken } = require('../jwt')
const router = express.Router();

router.post('/login', (req, res) => {
    User.where({ username: req.body.username }).fetch().then(result => {
        result = result.toJSON();
        let password = CryptoJS.SHA256(req.body.password).toString()
        if (password == result.password) {
            delete result.password;
            delete result.created_at;
            delete result.updated_at;
            let token = createJWToken(result)
            parseResponse(res, null, { ...result, token })
        }
        else {
            parseResponse(res, 'Invalid Password')
        }
    }).catch(err => {
        parseResponse(res, 'Invalid username and Password', err)
    })
})

router.get('/test', (req, res) => {

    User.collection().fetch().then(user => {
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
        req.body.password = CryptoJS.SHA256(req.body.password).toString();
        parseResponse(res, null, result)
    }).catch(err => {
        parseResponse(res, err)
    })
})
router.get('/userlist', (req, res) => {
    User.fetchAll().then(users => {
        parseResponse(res, null, users)
    }).catch(err => {
        parseResponse(res, err)
    })
})
router.get('/user/:id', (req, res) => {
    User.where({ id: req.params.id }).fetch().then(user => {
        parseResponse(res, null, user)
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.post('/user/:id', (req, res) => {
    if(req.body.password) {
        req.body.password = CryptoJS.SHA256(req.body.password).toString()
    }
    if(req.body.password=="") delete req.body.password
    User.where({ id: req.params.id }).save({ ...req.body },{ method: 'update', patch: true }).then(user => {
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