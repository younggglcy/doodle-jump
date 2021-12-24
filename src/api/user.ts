import { generateRequest, baseURL } from "../utils/request"
import { AxiosRequestConfig } from 'axios'

const request = generateRequest()

request.defaults.baseURL = baseURL + '/User'

request.defaults.headers.post = {
    'Content-Type': 'multipart/form-data'
}

const setAuth = () => {
    const token = localStorage.getItem('token')
    if (token) {
        return {
            headers: {
                "Authorization": `Bearer ${token}`
            } 
        } as AxiosRequestConfig
    }
    else return undefined
}

const register = (name: string) => {
    const data = new FormData()
    data.append("name", name)
    return request.post('/Register', data)
}

const updateMark = (mark: number) => {
    const data = new FormData()
    data.append("mark", mark.toString())
    
    return request.put('/UpdateMark', data, setAuth()) 
}

type RankItem = {
    rank: number,
    mark: number,
    name: string
}

type PageQuery = {
    pageSize?: number,
    pageNumber?: number
}

const getAllRank: (query: PageQuery) => Promise<RankItem[]> = (query) => {
    const { pageSize, pageNumber } = query
    if (pageSize !== undefined && pageNumber !== undefined) {
        return request.get('/GetAllRank', Object.assign(setAuth(), {
            params: query
        } as AxiosRequestConfig))
    }
    return request.get('/GetAllRank', setAuth())
}

const getOnlyRank = () => {
    return request.get('/GetOnlyRank', setAuth())
}

export { register, updateMark, getAllRank, getOnlyRank, setAuth }