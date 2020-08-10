const express = require('express');
const { User, Event, Config } = require('../modal/bookshelf')
const { parseResponse } = require('../util')
const { verifyJWTToken } = require('../jwt')
const async = require('async');
const path = require('path')
const fs = require('fs')
const XLSX = require('xlsx');
const { snakeCase } = require('change-case')

const router = express.Router();

// router.use(verifyJWTToken)

router.get('/', (req, res) => {


    async.series([
        callback => User.collection().count().then(count => callback(null, count)).catch(callback),
        callback => Event.collection().count().then(count => callback(null, count)).catch(callback),
        callback => Config.collection().fetchOne({ name: "active_event" }).then(activeEvent => {
            activeEvent = activeEvent.toJSON()
            // console.log(activeEvent)
            const workbook = XLSX.readFile(path.join(__dirname, `../../public/events/${activeEvent.value}/name-list/sheet.xlsx`));
            const sheet_name_list = workbook.SheetNames;
            let jsonData = sheet_name_list.reduce((total, item) => {
                total = [...total, ...XLSX.utils.sheet_to_json(workbook.Sheets[item]).map(i => ({ ...i, team: item }))]
                return total
            }, [])

            jsonData = jsonData.map(item => {
                const submitted = `./public/events/${activeEvent.value}/record-source/${item.team}/${snakeCase(item.name)}`;
                if (fs.existsSync(submitted)) {
                    item['submitted'] = fs.readdirSync(submitted)
                    item['submitted'].forEach(type => {
                        item[type + 'List'] = fs.readdirSync(`${submitted}/${type}`)
                        item['base'] = `/events/${activeEvent.value}/record-source/${item.team}/${snakeCase(item.name)}`
                    });
                }
                else {
                    item['submitted'] = []
                }
                return item;
            })
            callback(null, jsonData)
        }).catch(callback),
        callback => Config.collection().fetchOne({ name: "active_event" }).then(activeEvent => {
            activeEvent = activeEvent.toJSON()
            Event.where({ id: Number(activeEvent.value) }).fetch().then(event => callback(null, event)).catch(callback)
        }).catch(callback),
        callback => Config.collection().where({ name: "record_type" }).fetchOne().then(recordType => {
            recordType = recordType.toJSON()
            callback(null, recordType.value.split(','))
        })
    ], (err, result) => {
        if (err) console.log(err)
        let [userCount = 0, eventCount = 0, members = [], activeEvent = {}, recordType = {}] = result || [];
        parseResponse(res, null, {
            userCount,
            eventCount,
            members,
            activeEvent,
            recordType
        })
    })
})

module.exports = router