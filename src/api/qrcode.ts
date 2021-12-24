import { generateRequest, baseURL } from "../utils/request"

const request = generateRequest()

request.defaults.baseURL = baseURL + '/QrCode'

const getQrCode: (codeName: string) => Promise<ArrayBuffer> = (codeName: string) => {
    return request.get('/GetQrCode', {
        params: {
            codeName
        },
        responseType: 'arraybuffer'
    })
}

export { getQrCode }
