import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const BASE_URL = "https://blessedman.live"
export const API_URL = publicRuntimeConfig.API_URL