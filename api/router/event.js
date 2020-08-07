const express = require('express');
const { Event, Config } = require('../modal/bookshelf')
const { parseResponse } = require('../util')
const multer = require('multer')
const router = express.Router();
const fs = require('fs');
const { execSync } = require('child_process')
const path = require('path')
const { snakeCase } = require('change-case')



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { id } = req.params
        const dir = `./public/events/${id}/name-list`

        fs.mkdirSync(dir, { recursive: true });
        return cb(null, dir)
    },
    filename: (req, file, cb) => {
        cb(null, 'sheet.xlsx')
    }
})
const upload = multer({ storage: storage }).single('file')


router.get('/eventlist', (req, res) => {
    Event.forge().orderBy('created_at', "DESC").fetchAll().then(events => {
        Config.where({ name: "active_event" }).fetch().then(activeEvent => {
            parseResponse(res, null, { events, activeEvent })
        }).catch(err => {
            parseResponse(res, null, { events, activeEvent: {} })
        })
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.post('/addevent', (req, res) => {     //insert data
    Event.forge({
        name: '-',
        is_active: 0,
        user_id: 1,
        file: '/public',
    }).save().then(tempEvent => {
        req.params.id = tempEvent.id;
        upload(req, res, function (err) {
            if (err) return console.log(err);

            let createEvent = () => Event.forge({ id: req.params.id }).save({
                name: req.body.name,
                is_active: req.body.is_active,
                user_id: 1,
                file: `/events/${req.params.id}/name-list/${req.file.filename}`,
            }).then(event => {

                parseResponse(res, null, event)
            }).catch(err => {
                parseResponse(res, err)
            })
            console.log(typeof req.body.is_active);
            if (req.body.is_active == '1') {
                Config.where({ name: "active_event" }).save({ value: req.params.id }, { method: 'update', patch: true })
            }
            createEvent()

        })
    })
    // Event.forge(req.body).save().then(result => {
    //     // res.json({status})
    //     parseResponse(res, null, result)
    // }).catch(err => {
    //     parseResponse(res, err)
    // })
})

router.post('/delete-audios', (req, res) => {
    let { id, person, type } = req.body
    const dir = `./public/events/${id}/record-source/${person.team}/${snakeCase(person.name)}/${type}`;

    const removeDir = function (path) {
        if (fs.existsSync(path)) {
            const files = fs.readdirSync(path)

            if (files.length > 0) {
                files.forEach(function (filename) {
                    if (fs.statSync(path + "/" + filename).isDirectory()) {
                        removeDir(path + "/" + filename)
                    } else {
                        fs.unlinkSync(path + "/" + filename)
                    }
                })
                fs.rmdirSync(path)
            } else {
                fs.rmdirSync(path)
            }
        } else {
            console.log("Directory path not found.")
        }
    }

    removeDir(dir);

    res.send(req.body)
})

router.get('/:id', (req, res) => {    //edit data
    Event.where({ id: req.params.id }).fetch().then(event => {
        Config.where({ name: "active_event" }).fetch().then(activeEvent => {
            parseResponse(res, null, { event, activeEvent })

        }).catch(err => {
            parseResponse(res, null, { event, activeEvent: {} })

        })
    }).catch(err => {
        parseResponse(res, err)
    })
})

router.post('/:id', (req, res) => {  //update and save
    upload(req, res, function (err) {
        if (err) return console.log(err)

        let data = { ...req.body };
        if (req.file) {
            data['file'] = `/events/${req.params.id}/name-list/${req.file.filename}`
        }
        Event.where({ id: req.params.id }).save(data, { method: 'update', patch: true }).then(user => {
            parseResponse(res, null, user)
            if (req.body.is_active == '1') {
                Config.where({ name: "active_event" }).save({ value: req.params.id }, { method: 'update', patch: true })
            }
        }).catch(err => {
            parseResponse(res, err)
        })
    })
})

router.delete('/:id', (req, res) => {
    // fs.rmdirSync(`./public/events/${req.params.id}`, { recursive: true });
    new Event({ id: req.params.id }).destroy().then(user => {
        parseResponse(res, null, user)

        // const DIR = path.resolve(__dirname, `../../public/events/${req.params.id}`)
        // console.log(DIR)
        // if (process.platform === 'win32') {
        //     execSync(`del /f /s ${DIR}`)
        // } else {
        //     execSync(`rm -rf ${DIR}`)
        // }

    }).catch(err => {
        parseResponse(res, err)
    })

})

module.exports = router