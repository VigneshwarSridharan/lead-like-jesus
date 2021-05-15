import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const BASE_URL = "https://zerra.co.in"
// export const BASE_URL = "http://localhost:8081"
export const API_URL = publicRuntimeConfig.API_URL