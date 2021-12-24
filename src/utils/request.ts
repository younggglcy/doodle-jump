import Axios from 'axios'

// export const baseURL = 'https://christmas.platelets.xyz/api'
export const baseURL = 'https://christmas-api.itoken.team/api'
const generateRequest = () => {
    const request = Axios.create({
        baseURL,
    })
    
    request.interceptors.response.use(res => {
        // 对响应数据做点什么
        // console.log(res)
        if (!!res.data) return Promise.resolve(res.data)
        else return Promise.resolve(res)
    }, err => {
        // 对响应错误做点什么
        console.log('response ERROR!', err)
        return Promise.reject(err)
    });

    return request
}

export { generateRequest }
