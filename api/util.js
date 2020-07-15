const parseResponse = (res, err = null, data = {}) => {
    // status:"success",
    if (err) {
        return res.json({ status: "0", massage: err, data })
    }
    else {
        return res.json({ status: "1", data })
    }
}

module.exports = {
    parseResponse
}