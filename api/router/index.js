const express = require('express');
const path = require('path')
const fs = require('fs')
const XLSX = require('xlsx');
const multer = require('multer')
const async = require('async');
const archiver = require('archiver');
const { snakeCase } = require('change-case')
const { Event, Config } = require('../modal/bookshelf');
const { parseResponse } = require('../util');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        Config.collection().fetchOne({ name: "active_event" }).then(activeEvent => {
            activeEvent = activeEvent.toJSON()


            const { team, user, recordType } = req.params
            const dir = `./public/events/${activeEvent.value}/record-source/${team}/${user}/${recordType}`

            fs.mkdirSync(dir, { recursive: true });
            return cb(null, dir)
        })
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })
const router = express.Router();

router.get('/login/:id', (req, res) => {
    const { id } = req.params;

    Config.collection().fetchOne({ name: "active_event" }).then(activeEvent => {
        activeEvent = activeEvent.toJSON()
        const workbook = XLSX.readFile(path.join(__dirname, `../../public/events/${activeEvent.value}/name-list/sheet.xlsx`));
        const sheet_name_list = workbook.SheetNames;
        const jsonData = sheet_name_list.reduce((total, item) => {
            total = [...total, ...XLSX.utils.sheet_to_json(workbook.Sheets[item]).map(i => ({ ...i, team: item }))]
            return total
        }, [])

        // return res.send(jsonData)
        const userDetails = jsonData.find(f => f.id.toLowerCase() == id.toLowerCase());

        var result = {}
        if (userDetails) {
            let teamMembers = jsonData.filter(item => item.team == userDetails.team && item.id.toLowerCase() != id.toLowerCase())
            const genericUrl = `./public/events/${activeEvent.value}/record-source/${userDetails.team}/${snakeCase(userDetails.name)}/generic`;
            const scriptureUrl = `./public/events/${activeEvent.value}/record-source/${userDetails.team}/${snakeCase(userDetails.name)}/scripture`;
            let genericList = [];
            let scriptureList = [];
            if (fs.existsSync(genericUrl)) {
                genericList = fs.readdirSync(genericUrl)
            }
            if (fs.existsSync(scriptureUrl)) {
                scriptureList = fs.readdirSync(scriptureUrl)
            }

            teamMembers = teamMembers.map(item => {
                let generic = genericList.find(f => f.includes(snakeCase(item.name))) || '';
                let scripture = scriptureList.find(f => f.includes(snakeCase(item.name))) || '';
                if (generic) {
                    generic = `/events/${activeEvent.value}/record-source/${userDetails.team}/${snakeCase(userDetails.name)}/generic/${generic}`
                }
                if (scripture) {
                    scripture = `/events/${activeEvent.value}/record-source/${userDetails.team}/${snakeCase(userDetails.name)}/scripture/${scripture}`
                }
                return { ...item, generic, scripture };
            })

            result = {
                status: 'success',
                data: {
                    userDetails,
                    teamMembers
                }
            }
        }
        else {
            result = {
                status: 'error',
                message: 'User not found'
            }
        }

        res.send(result);
    })


})

router.post('/submit/:team/:user/:recordType', upload.array('audios[]'), (req, res) => {

    res.json({ files: req.files })
    // makeAudioMerge((err, result) => {
    // })
    // var file = JSON.parse(JSON.stringify(req.files))
})

function mergeAudio(list, output, callback) {
    let files = list,
        clips = [],
        stream,
        currentfile,
        dhh = fs.createWriteStream(output);



    files.forEach(function (file) {
        clips.push(file);
    });
    function main() {
        if (!clips.length) {
            dhh.end("Done");
            callback(null, 'Done')
            return;
        }
        currentfile = clips.shift();
        stream = fs.createReadStream(currentfile);
        stream.pipe(dhh, { end: false });
        stream.on("end", function () {
            console.log(currentfile + ' appended');
            main();
        });
    }
    main();
}

function makeAudioMerge(activeEvent, callback) {
    var basePath1 = `./public/events/${activeEvent.value}/record-source`
    var teams = fs.readdirSync(basePath1);

    const workbook = XLSX.readFile(path.join(__dirname, `../../public/events/${activeEvent.value}/name-list/sheet.xlsx`));
    const sheet_name_list = workbook.SheetNames;
    const jsonData = sheet_name_list.reduce((total, item) => {
        total = [...total, ...XLSX.utils.sheet_to_json(workbook.Sheets[item]).map(i => ({ ...i, team: item }))]
        return total
    }, [])

    let result = [];

    ['generic', 'scripture'].map(type => {

        teams.map(team => {
            let members = fs.readdirSync(basePath1 + '/' + team);
            let nameList = jsonData.filter(f => f.team == team);
            nameList.map(nameItem => {

                let tempFiles = [];
                members.map(member => {
                    if (!fs.existsSync(basePath1 + '/' + team + '/' + member + '/' + type)) return
                    let files = fs.readdirSync(basePath1 + '/' + team + '/' + member + '/' + type)

                    if (files.includes(member + '-' + snakeCase(nameItem.name) + '.mp3')) {
                        tempFiles.push(
                            basePath1 + '/' + team + '/' + member + '/' + type + '/' + member + '-' + snakeCase(nameItem.name) + '.mp3'
                        )
                        tempFiles.push(
                            './public/tones/chime.mp3'
                        )
                    }
                })
                let output = `./public/events/${activeEvent.value}/merged/${team}/${type}`
                fs.mkdirSync(output, { recursive: true });

                if (tempFiles.length) {
                    tempFiles.pop();
                    result.push({
                        files: tempFiles,
                        output: output + '/' + snakeCase(nameItem.name) + '.mp3'
                    })
                }
            })
        })

    })



    async.series(
        result.map(item => function (callback) {
            mergeAudio(item.files, item.output, callback)
        }),
        function (err, results) {
            console.log(err)
            console.log(results);
            callback(err, result)
            // results is now equal to [1, 2, 3]
        }
    )
}

function makeZip(input, output, callback) {

    var output = fs.createWriteStream(output);
    var archive = archiver('zip');

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        callback(null, 'Zip Done')
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);

    // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
    archive.directory(input, false);
    archive.finalize();

}

router.get('/merge/:id', (req, res) => {
    if (fs.existsSync(`./public/events/${req.params.id}/record-source`)) {
        // Config.collection().fetchOne({ name: "active_event" }).then(activeEvent => {
            let activeEvent = {value:req.params.id}

            makeAudioMerge(activeEvent, (err, result) => {
                let zipSource = `./public/events/${activeEvent.value}/merged`
                let zipDist = `./public/events/${activeEvent.value}/merged.zip`
                makeZip(zipSource, zipDist, (err, status) => {
                    res.download(zipDist)
                })

                // res.json(result)
            });
        // })
    }
    else {
        res.send('<center><h1>Record Source Not Found</h1></center>')
    }


    // var files = fs.readdirSync('./public/events/10-07-2020/record-source/Team-B/brittani_bilt')
    // var output = './brittani_bilt-merge.mp3';
    // files = files.map(i => './public/events/10-07-2020/record-source/Team-B/brittani_bilt/' + i)
    // mergeAudio(files, output)
})

module.exports = router;