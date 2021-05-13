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
const nodemailer = require("nodemailer");

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

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "f54f586e8a8dbe",
        pass: "2d2e3fc42c0016"
    }
});
const TEMPLATE = fs.readFileSync('./api/mail.html', 'utf-8')

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
            const appreciationUrl = `./public/events/${activeEvent.value}/record-source/${userDetails.team}/${snakeCase(userDetails.name)}/appreciation`;
            const scriptureUrl = `./public/events/${activeEvent.value}/record-source/${userDetails.team}/${snakeCase(userDetails.name)}/scripture`;
            let appreciationList = [];
            let scriptureList = [];
            if (fs.existsSync(appreciationUrl)) {
                appreciationList = fs.readdirSync(appreciationUrl)
            }
            if (fs.existsSync(scriptureUrl)) {
                scriptureList = fs.readdirSync(scriptureUrl)
            }

            teamMembers = teamMembers.map(item => {
                let appreciation = appreciationList.find(f => f.includes(snakeCase(item.name))) || '';
                let scripture = scriptureList.find(f => f.includes(snakeCase(item.name))) || '';
                if (appreciation) {
                    appreciation = `/events/${activeEvent.value}/record-source/${userDetails.team}/${snakeCase(userDetails.name)}/appreciation/${appreciation}`
                }
                if (scripture) {
                    scripture = `/events/${activeEvent.value}/record-source/${userDetails.team}/${snakeCase(userDetails.name)}/scripture/${scripture}`
                }
                return { ...item, appreciation, scripture };
            })

            let teamMembersTable = jsonData.filter(item => item.team == userDetails.team)
            teamMembersTable = teamMembersTable.map(item => {
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

            result = {
                status: 'success',
                data: {
                    userDetails,
                    teamMembers,
                    teamMembersTable,
                    activeEvent
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

    if (Array.isArray(req.files)) {
        async.parallel(req.files.map(item => callback => {
            let { path: filePath, filename } = item
            let basePath = item.path.split('\\');
            basePath.pop()
            basePath = basePath.join('\\')
            let output = `${basePath}/${filename.replace('.mp3', '')}-loudnorm.mp3`;
            exec(`ffmpeg -i ${filePath} -filter:a loudnorm="i=-24:lra=7.0:tp=-2.0" ${output}`, (err, stdout, stderr) => {
                if (err) {
                    callback(err)
                }
                else {
                    fs.unlinkSync(filePath)
                    // console.log(filePath + ' - Deleted')
                    fs.renameSync(output, filePath)
                    // console.log('Renamed: ' + output + ' to ' + filePath)
                    callback(null, 'done')
                }
            })
        }), (err, result) => {
            if (err) {
                console.log(err, result)
                return
            }
            console.log(err, result)
        })
    }
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

            exec(`ffmpeg -i ${output} -y -ar 44100 ${output.replace('.mp3', '-FIX.mp3')}`, (err, stdout, stderr) => {
                if (err) {
                    //some err occurred
                    console.log(`Fix Audio Faild: ${output} to ${output.replace('.mp3', '-FIX.mp3')}`)
                    req.app.socket.emit('info', { message: `<p class="m-0 text-danger">Fix Audio Faild: ${output.split('/').pop()} to ${output.replace('.mp3', '-LLJ.mp3').split('/').pop()}</p>` })
                    callback(null, 'done')
                } else {
                    // the *entire* stdout and stderr (buffered)
                    // console.log(`stdout: ${stdout}`);
                    // console.log(`stderr: ${stderr}`);
                    console.log(`Fix Audio: ${output} to ${output.replace('.mp3', '-FIX.mp3')}`)
                    // `ffmpeg -i ${'./public/tones/piano-loudnorm.mp3'} -i ${output.replace('-FIX.mp3', '-LLJ.mp3')} -filter_complex amix=inputs=2:duration=first:dropout_transition=3 OUTPUT.mp3`
                    req.app.socket.emit('info', { message: `<p class="m-0">Fix Audio: ${output.split('/').pop()} to ${output.replace('.mp3', '-LLJ.mp3').split('/').pop()}</p>` })
                    exec(`ffmpeg -i ${output.replace('.mp3', '-FIX.mp3')} -i ${'./public/tones/bg-music.mp3'} -y -filter_complex amix=inputs=2:duration=first:dropout_transition=3 ${output.replace('.mp3', '-LLJ.mp3')}`, (err, stdout, stderr) => {
                        if (err) {
                            callback(err)
                        }
                        else {
                            console.log(`Adding Background Music: ${output.replace('.mp3', '-LLJ.mp3').split('/').pop()}`)
                            req.app.socket.emit('info', { message: `<p class="m-0">Adding Background Music: ${output.replace('.mp3', '-LLJ.mp3').split('/').pop()}</p>` })
                            fs.unlinkSync(output)
                            fs.unlinkSync(output.replace('.mp3', '-FIX.mp3'))
                            callback(null, 'done')
                        }
                    })
                    // fs.unlink(output, (err) => {
                    //     if (err) {
                    //         console.log(`Delete Faild: ${output}`)
                    //         req.app.socket.emit('info', { message: `<p class="m-0 text-danger">Delete Faild: ${output.split('/').pop()}</p>` })
                    //     }
                    //     else {
                    //         console.log(`Delete Bug Audio: ${output}`)
                    //         req.app.socket.emit('info', { message: `<p class="m-0">Delete Bug Audio: ${output.split('/').pop()}</p>` })
                    //     }
                    //     callback(null, 'done')
                    // })
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

    ['appreciation', 'scripture'].map(type => {

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

const mergeSingleUserAudio = (req) => new Promise((resolve, reject) => {
    let { eventId, teamId, user, type } = req.params
    try {
        var basePath1 = `./public/events/${eventId}/record-source`;

        const workbook = XLSX.readFile(path.join(__dirname, `../../public/events/${eventId}/name-list/sheet.xlsx`));
        const sheet_name_list = workbook.SheetNames;
        const jsonData = sheet_name_list.reduce((total, item) => {
            total = [...total, ...XLSX.utils.sheet_to_json(workbook.Sheets[item]).map(i => ({ ...i, team: item }))]
            return total
        }, [])
        let result = [];

        let nameList = jsonData.filter(f => f.team == teamId);
        let members = fs.readdirSync(basePath1 + '/' + teamId);


        let tempFiles = [];
        members.map(member => {
            if (!fs.existsSync(basePath1 + '/' + teamId + '/' + member + '/' + type)) return
            let files = fs.readdirSync(basePath1 + '/' + teamId + '/' + member + '/' + type)

            if (files.includes(member + '-' + snakeCase(user) + '.mp3')) {
                tempFiles.push(
                    basePath1 + '/' + teamId + '/' + member + '/' + type + '/' + member + '-' + snakeCase(user) + '.mp3'
                )
                tempFiles.push(
                    './public/tones/chime.mp3'
                )
            }
        })
        let output = `./public/events/${eventId}/merged/${teamId}/${type}`
        fs.mkdirSync(output, { recursive: true });

        if (tempFiles.length) {
            tempFiles.pop();
            result.push({
                files: tempFiles,
                output: output + '/' + snakeCase(user) + '.mp3'
            })
        }

        async.series(
            result.map(item => function (callback) {
                mergeAudio(item.files, item.output, req, callback)
            }),
            function (err, results) {
                console.log(err)
                console.log(results);
                resolve(`./public/events/${eventId}/merged/${teamId}/${type}/${user}-LLJ.mp3`);
            }
        )

    }
    catch (err) {
        reject(err)
    }
})

router.get('/merge-user-audio/:eventId/:teamId/:user/:type', async (req, res) => {
    try {
        let url = await mergeSingleUserAudio(req)
        res.download(url)
    }
    catch (err) {
        res.status(400).send(err.toString())
    }
})
router.get('/mail-merge-user-audio/:eventId/:teamId/:user/:type', async (req, res) => {
    try {
        let { eventId, teamId, user, type } = req.params
        let url = await mergeSingleUserAudio(req)
        const workbook = XLSX.readFile(path.join(__dirname, `../../public/events/${eventId}/name-list/sheet.xlsx`));
        const sheet_name_list = workbook.SheetNames;
        const jsonData = sheet_name_list.reduce((total, item) => {
            total = [...total, ...XLSX.utils.sheet_to_json(workbook.Sheets[item]).map(i => ({ ...i, team: item }))]
            return total
        }, [])
        let userDetails = jsonData.find(f => snakeCase(f.name) == user && f.team == teamId)

        let template = TEMPLATE
        template = template.replace('{{name}}', userDetails.name)
        template = template.replace('{{content}}', `
        Thanks for your participation, Herewith we have attached your feedback of teammates
        <br /><br />
        <b>Node:</b></br>
        Please find attachment
        `)
        let info = await transport.sendMail({
            from: 'foo@example.com', // sender address
            to: userDetails.id, // list of receivers
            subject: "Lead Like Jesus", // Subject line
            html: template, // html body
            attachments: [
                {
                    filename: path.resolve(__dirname, '../.' + url).split('\\').pop(),
                    content: fs.createReadStream(path.resolve(__dirname, '../.' + url)),
                    // contentType: 'audio/mpeg'
                }
            ]
        });

        res.send({
            status: 1,
            userDetails
        })
    }
    catch (err) {
        res.send({
            status: 0
        })
    }
})

router.post('/invitation/:id', async (req, res) => {
    try {
        let { invitations } = req.body
        let event = await Event.where({ id: req.params.id }).fetch()
        event = event.toJSON()
        console.log(req.params.id)
        const workbook = XLSX.readFile(path.join(__dirname, `../../public/events/${event.id}/name-list/sheet.xlsx`));
        const sheet_name_list = workbook.SheetNames;
        const jsonData = sheet_name_list.reduce((total, item) => {
            total = [...total, ...XLSX.utils.sheet_to_json(workbook.Sheets[item]).map(i => ({ ...i, team: item }))]
            return total
        }, [])

        for (const user of jsonData) {
            if (invitations.includes(user.id)) {
                console.log(user.name)
                let template = TEMPLATE
                template = template.replace('{{name}}', user.name)
                template = template.replace('{{content}}', `
                Herewith we have shared login invitation for ${event.name}
                <br /><br />
                <a href="http://zerra.co.in/login?id=${user.id}">Click here to Login</a>
                `)
                let info = await transport.sendMail({
                    from: 'foo@example.com', // sender address
                    to: user.id, // list of receivers
                    subject: `Lead Like Jesus - ${event.name} invitation`, // Subject line
                    html: template, // html body
                });
            }
        }

        res.send({
            status: 1
        })
    }
    catch (err) {
        res.send({
            status: 0
        })
    }
})

module.exports = router;