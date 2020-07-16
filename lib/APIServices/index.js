import http from 'axios';
import { API_URL } from '../constants';

// const API_URL = "http://localhost:3100/api"
// const API_URL = "http://147.135.100.91:8080/api"

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
    login: id => request.get('/login/' + id),
    adduser: data => request.post('/adduser/' + data)
}

const DashboardServices = {
    login: (username, password) => request.post('/auth/login', { username, password })
}

const EventServices = {
    add: (data, config = {}) => request.post(`/event/addevent`, data, config),
    update: (id, data, config = {}) => request.post(`/event/${id}`, data, config)
}

const Test = {
    test: data => request.post('/test', data)
}


export {
    request,
    AuthServie,
    EventServices,
    Test,
    DashboardServices
}