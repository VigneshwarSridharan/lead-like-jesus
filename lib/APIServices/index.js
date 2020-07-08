import http from 'axios';

const API_URL = "/api"
// const API_URL = "https://lead-like-jesus.vercel.app/api"

const getConfig = () => {
    let config = {};
    let token = localStorage.getItem('token')

    if (token) {
        config = {
            ...config,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    }

    return config
}

const parseRes = res => res.data

const request = {
    get: url => http.get(`${API_URL}${url}`, getConfig()).then(parseRes),
    post: (url, data) => http.post(`${API_URL}${url}`, data, getConfig()).then(parseRes),
    put: (url, data) => http.put(`${API_URL}${url}`, data, getConfig()).then(parseRes),
    delete: (url) => http.delete(`${API_URL}${url}`, getConfig()).then(parseRes),
}

const AuthServie = {
    login: id => request.get('/login/' + id)
}


export {
    request,
    AuthServie
}