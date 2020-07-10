const express = require('express');
const path = require('path')
const fs = require('fs')
const XLSX = require('xlsx');
const multer = require('multer')
const async = require('async');
const archiver = require('archiver');
const { snakeCase } = require('change-case')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { team, user } = req.params
        const dir = `./public/events/10-07-2020/record-source/${team}/${user}/`
        // fs.exists(dir, exist => {
        //     if (!exist) {
        //         return fs.mkdir(dir, error => cb(error, dir))
        //     }
        // })
        fs.mkdirSync(dir, { recursive: true });
        return cb(null, dir)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })
const router = express.Router();

router.get('/login/:id', (req, res) => {
    const { id } = req.params;

    const workbook = XLSX.readFile(path.join(__dirname, '../public/events/10-07-2020/name-list/sheet.xlsx'));
    const sheet_name_list = workbook.SheetNames;
    const jsonData = sheet_name_list.reduce((total, item) => {
        total = [...total, ...XLSX.utils.sheet_to_json(workbook.Sheets[item]).map(i => ({ ...i, team: item }))]
        return total
    }, [])

    // return res.send(jsonData)
    const userDetails = jsonData.find(f => f.id == id);

    var result = {}
    if (userDetails) {
        const teamMembers = jsonData.filter(item => item.team == userDetails.team && item.id != id)
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

router.post('/submit/:team/:user', upload.array('audios[]'), (req, res) => {

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

function makeAudioMerge(callback) {
    var basePath1 = './public/events/10-07-2020/record-source'
    var teams = fs.readdirSync(basePath1);

    const workbook = XLSX.readFile(path.join(__dirname, '../public/events/10-07-2020/name-list/sheet.xlsx'));
    const sheet_name_list = workbook.SheetNames;
    const jsonData = sheet_name_list.reduce((total, item) => {
        total = [...total, ...XLSX.utils.sheet_to_json(workbook.Sheets[item]).map(i => ({ ...i, team: item }))]
        return total
    }, [])

    let result = [];
    teams.map(team => {
        let members = fs.readdirSync(basePath1 + '/' + team);
        let nameList = jsonData.filter(f => f.team == team);
        nameList.map(nameItem => {

            let tempFiles = [];

            members.map(member => {
                let files = fs.readdirSync(basePath1 + '/' + team + '/' + member)

                if (files.includes(member + '-' + snakeCase(nameItem.name) + '.mp3')) {
                    tempFiles.push(
                        basePath1 + '/' + team + '/' + member + '/' + member + '-' + snakeCase(nameItem.name) + '.mp3'
                    )
                    tempFiles.push(
                        './public/tones/chime.mp3'
                    )
                }
            })
            let output = './public/events/10-07-2020/merged/' + team
            fs.mkdirSync(output, { recursive: true });

            tempFiles.pop();
            result.push({
                files: tempFiles,
                output: output + '/' + snakeCase(nameItem.name) + '.mp3'
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

router.get('/merge', (req, res) => {

    makeAudioMerge((err, result) => {
        let zipSource = './public/events/10-07-2020/merged'
        let zipDist = './public/events/10-07-2020/merged.zip'
        makeZip(zipSource, zipDist, (err,status) => {
            res.download(zipDist)
        } )

        // res.json(result)
    });

    // var files = fs.readdirSync('./public/events/10-07-2020/record-source/Team-B/brittani_bilt')
    // var output = './brittani_bilt-merge.mp3';
    // files = files.map(i => './public/events/10-07-2020/record-source/Team-B/brittani_bilt/' + i)
    // mergeAudio(files, output)
})

module.exports = router;