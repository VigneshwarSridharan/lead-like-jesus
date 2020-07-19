let jwt = require('jsonwebtoken');
let {parseResponse} = require('./util');

let SHA = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'

let createJWToken = (data = {}) => {
    let iat = new Date().getTime();
    let hours = 1;
    let exp = iat + (1000 * 60 * 60) * hours;
    return jwt.sign({ ...data, iat, exp }, SHA);
}


let verifyJWTToken = (req, res, next) => {
    let { 'x-token': token = "" } = req.headers || {};
    token = token || req.body.token;
    if (token) {
        jwt.verify(token, SHA, (err, decode) => {

            if (err) return parseResponse(res,err, 'Unexpected token');

            if ('exp' in decode && decode.exp - new Date().getTime() > 0) {
                let { id } = decode;
                req.user_id = id;
                next()
            }
            else {
                parseResponse(res,true, 'Token expired');
            }
        });
    }
    else {
        parseResponse(res,'Token missing');
    }
}

const getInfo = (token, callback) => {
    if (token) {
        jwt.verify(token, SHA, (err, decode) => {

            if (err) return callback(err);

            if ('exp' in decode && decode.exp - new Date().getTime() > 0) {
                callback(null, decode);
            }
            else {
                callback('Token expired')
            }
        });
    }
    else {
        callback('Token missing')
    }
}

module.exports = {
    createJWToken,
    verifyJWTToken,
    getInfo
}