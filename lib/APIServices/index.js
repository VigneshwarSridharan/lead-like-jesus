import http from 'axios';

// const API_URL = "/api"
const API_URL = "http://147.135.100.91:8080/api"

const getConfig = (config) => {
    let token = localStorage.getItem('token')

    if (token) {
        config = {
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${token}`
            }
        }
    }

    return config
}

const parseRes = res => res.data

const request = {
    get: (url, config = {}) => http.get(`${API_URL}${url}`, getConfig(config)).then(parseRes),
    post: (url, data, config = {}) => http.post(`${API_URL}${url}`, data, getConfig(config)).then(parseRes),
    put: (url, data, config = {}) => http.put(`${API_URL}${url}`, data, getConfig(config)).then(parseRes),
    delete: (url, config = {}) => http.delete(`${API_URL}${url}`, getConfig(config)).then(parseRes),
}

const AuthServie = {
    login: id => request.get('/login/' + id)
}

const Test = {
    test: data => request.post('/test', data)
}


export {
    request,
    AuthServie,
    Test
}