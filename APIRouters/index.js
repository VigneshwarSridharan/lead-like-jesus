const express = require('express');
const path = require('path')
var XLSX = require('xlsx');
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

module.exports = router;