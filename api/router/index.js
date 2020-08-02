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
const audioconcat = require('audioconcat');
const { exec } = require('child_process');
const { route } = require('next/dist/next-server/server/router');

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

function mergeAudio(list, output, req, callback) {
    req.app.socket.emit('info', {
        message: `
    <hr />
    <p class="m-0">Merge of: ${output.split('/').pop()}</p>
    <ol>
        ${list.filter(f => !f.includes('chime')).map(item => `<li>${item.split('/').pop()}</li>`).join('')}
    </ol>
    
    ` })
    audioconcat(list)
        .concat(output)
        .on('start', function (command) {
            console.log('ffmpeg process started:', command);
        })
        .on('error', function (err, stdout, stderr) {
            console.error('Error:', err)
            console.error('ffmpeg stderr:', stderr);
        })
        .on('end', function (ac_output) {
            console.error('Audio created in:', output);

            req.app.socket.emit('info', { message: `<p class="m-0">Merge created in: ${output.split('/').pop()}</p>` })

            exec(`ffmpeg -i ${output} -y -ar 44100 ${output.replace('.mp3', '-LLJ.mp3')}`, (err, stdout, stderr) => {
                if (err) {
                    //some err occurred
                    console.log(`Fix Audio Faild: ${output} to ${output.replace('.mp3', '-LLJ.mp3')}`)
                    req.app.socket.emit('info', { message: `<p class="m-0 text-danger">Fix Audio Faild: ${output.split('/').pop()} to ${output.replace('.mp3', '-LLJ.mp3').split('/').pop()}</p>` })
                    callback(null, 'done')
                } else {
                    // the *entire* stdout and stderr (buffered)
                    // console.log(`stdout: ${stdout}`);
                    // console.log(`stderr: ${stderr}`);
                    console.log(`Fix Audio: ${output} to ${output.replace('.mp3', '-LLJ.mp3')}`)
                    req.app.socket.emit('info', { message: `<p class="m-0">Fix Audio: ${output.split('/').pop()} to ${output.replace('.mp3', '-LLJ.mp3').split('/').pop()}</p>` })
                    fs.unlink(output, (err) => {
                        if (err) {
                            console.log(`Delete Faild: ${output}`)
                            req.app.socket.emit('info', { message: `<p class="m-0 text-danger">Delete Faild: ${output.split('/').pop()}</p>` })
                        }
                        else {
                            console.log(`Delete Bug Audio: ${output}`)
                            req.app.socket.emit('info', { message: `<p class="m-0">Delete Bug Audio: ${output.split('/').pop()}</p>` })
                        }
                        callback(null, 'done')
                    })
                }
            });

        });
}

function makeAudioMerge(activeEvent, req, callback) {
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

        teams.map((team, inx) => {
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

    // result.splice(1);

    async.series(
        result.map(item => function (callback) {
            mergeAudio(item.files, item.output, req, callback)
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
    input.forEach((item) => {
        archive.directory(item, item.split('/').pop());
    })
    archive.finalize();

}

router.get('/merge/:id', (req, res) => {

    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    });

    if (fs.existsSync(`./public/events/${req.params.id}/record-source`)) {
        let activeEvent = { value: req.params.id }

        req.app.socket.emit('info', { message: `<p class="m-0">Merging process start.</p>` })
        makeAudioMerge(activeEvent, req, (err, result) => {
            req.app.socket.emit('info', { message: `<p class="m-0">Merging process Finshed.</p>` })
            let zipSource = [`./public/events/${activeEvent.value}/merged`, `./public/events/${activeEvent.value}/record-source`,]
            let zipDist = `./public/events/${activeEvent.value}/merged.zip`
            req.app.socket.emit('info', { message: `<p class="m-0">Zipping process start.</p>` })
            makeZip(zipSource, zipDist, (err, status) => {
                req.app.socket.emit('info', { message: `<p class="m-0">Zipping process Finshed.</p>` })
                req.app.socket.emit('info', { message: `<div class="p-3 border-top text-center"><a class="btn btn-success" href="${`/events/${activeEvent.value}/merged.zip`}"><i class="fas fa-download mr-2"></i> Download The Zip</a></div>` })
                res.write(`data: ${JSON.stringify({ message: 'end' })}\n\n`)
                res.end()
            })

            // res.json(result)
        });
    }
    else {
        req.app.socket.emit('info', { message: `<p class="m-0">Sorry! Record Source Not Found.</p>` })
        res.write(`data: ${JSON.stringify({ message: 'end' })}\n\n`)
        res.end()
    }

})

module.exports = router;