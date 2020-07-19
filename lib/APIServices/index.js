import http from 'axios';
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const { API_URL } = publicRuntimeConfig;

const getOptions = (config) => {
    let token = localStorage.getItem('token')

    if (token) {
        config = {
            ...config,
            headers: {
                ...config.headers,
                "x-token": token
            }
        }
    }

    return config
}

const parseRes = res => res.data

const request = {
    get: (url, config = {}) => http.get(`${API_URL}${url}`, getOptions(config)).then(parseRes),
    post: (url, data, config = {}) => http.post(`${API_URL}${url}`, data, getOptions(config)).then(parseRes),
    put: (url, data, config = {}) => http.put(`${API_URL}${url}`, data, getOptions(config)).then(parseRes),
    delete: (url, config = {}) => http.delete(`${API_URL}${url}`, getOptions(config)).then(parseRes),
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