import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const BASE_URL = "http://zerra.co.in"
export const API_URL = publicRuntimeConfig.API_URL