const express = require('express');
const path = require('path')
const fs = require('fs')
const XLSX = require('xlsx');
const multer = require('multer')
const storage = multer.diskStorage({
    destination:  (req, file, cb) => {
        const { team } = req.params
        const dir = `./public/events/10-07-2020/record-source/${ team }/`
        // fs.exists(dir, exist => {
        //     if (!exist) {
        //         return fs.mkdir(dir, error => cb(error, dir))
        //     }
        // })
        fs.mkdirSync(dir,{recursive: true});
        return cb(null, dir)
    },
    filename:  (req, file, cb) => {
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

router.post('/test/:team', upload.array('audios[]'), (req, res) => {

    res.json({ files: req.files, ...req.body })
    // var file = JSON.parse(JSON.stringify(req.files))
})

module.exports = router;