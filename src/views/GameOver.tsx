import '../styles/gameover.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQrCode } from '../api/qrcode'
import { getAllRank, getOnlyRank } from '../api/user'
import { Modal, Button, Table, TableColumnsType } from 'antd'
import html2canvas from 'html2canvas'

const Gameover = () => {

    const navigate = useNavigate()

    const restart = () => {
        navigate('/')
    }

    const name = localStorage.getItem('username')
    const score = localStorage.getItem('thisTimePoints')

    const [isRankModalVisible, setIsRankModalVisible] = useState(false)

    const [rankList, setRankList] = useState<Array<RankItem & {key: any}>>([])

    const PAGESIZE = 10 

    const rank = () => {
        setIsRankModalVisible(true)
    }

    const handleRankModalCancel = () => {
        setIsRankModalVisible(false)
    }

    const [curPage, setCurPage] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(true)

    const goPrevious = () => {
        setCurPage(p => p - 1)
    }

    const goNext = () => {
        setCurPage(p => p + 1)
    }

    useEffect(() => {
        getAllRank({
            pageSize: PAGESIZE,
            pageNumber: curPage
        }).then(res => {
            console.log('rank data', res)
            setRankList(res.map((item, index) => {
                return {
                    ...item,
                    key: index
                }
            }))
            if (res.length !== PAGESIZE) setHasNextPage(false)
            else setHasNextPage(true)
        }).catch(err => {
            setRankList([])
            setHasNextPage(false)
        })
    }, [curPage])

    const columns: TableColumnsType<object> = [{
        title: '排名',
        dataIndex: 'rank',
        align: 'center'
    }, {
        title: '用户名',
        dataIndex: 'name',
        align: 'center',
    }, {
        title: '分数',
        dataIndex: 'mark',
        align: 'center'
    }]

    const [isQrCodeModalVisible, setIsQrCodeModalVisible] = useState(false)
    const [qrCodeURL, setQrCodeURL] = useState('')
    const [savePicURL, setSavePicURL] = useState('')

    const share = async () => {
        const qrCodeURL = localStorage.getItem('qrCodeURL')

        if (userRank === -1) {
            await getOnlyRank().then((res) => {
                console.log('getOnlyRank Ok', res)
                const { rank } = res as unknown as { rank: number, name: string }
                setUserRank(rank)
            })
        }

        if (!!qrCodeURL) {
            setQrCodeURL(qrCodeURL)
        } else {
            await getQrCode('Christmas-test').then(res => {
                return 'data:image/png;base64,' + btoa(
                    new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), '')
                )
            }).then(data => {
                setQrCodeURL(data)
                localStorage.setItem('qrCodeURL', data)
            })
        }

        setIsQrCodeModalVisible(true)

        Promise.resolve(savePic()).then(res => {
            return res.toDataURL('image/jpg')
        }).then(res => {
            console.log('savePicURL', res)
            setSavePicURL(res)
        }).catch(e => console.log(e))

    }

    const handleQrCodeModalCancel = () => {
        setIsQrCodeModalVisible(false)
    }

    const [userRank, setUserRank] = useState(-1)
            
    //基本方案就是： html -> canvas -> image -> a[download]
    const savePic = async () => {

        const getDPR = () => {
            if (window.devicePixelRatio && window.devicePixelRatio > 1) {
                return window.devicePixelRatio
            }
            return 1
        }

        const el = document.getElementById('picArea')!
        // const canvas = document.createElement('canvas') // React下不能这么写?

        // const width = el.offsetWidth
        // const height = el.offsetHeight

        // // 设定 canvas 元素属性宽高为 DOM 节点宽高 * 像素比
        // const dpr = getDPR()
        // canvas.width = width * dpr
        // canvas.height = height * dpr
        // // 设定 canvas css宽高为 DOM 节点宽高
        // canvas.style.width = `${width}px`
        // canvas.style.height = `${height}px`
        // // 获取画笔
        // const context = canvas.getContext('2d')

        // // 将所有绘制内容放大像素比倍
        // context!.scale(dpr, dpr)

        // return await html2canvas(el, { canvas }).then(res => {
        //     canvas.remove()
        //     return res
        // })
        return await html2canvas(el)
    }

    return (
        <>
            <div className="gameover-container">
                {/* <div className='msg'>一些有趣的话</div>     */}
                <div className='btn-container'>
                    <Button onClick={restart} shape='circle' className='btn'>重开</Button>
                    <Button onClick={share} shape='circle' className='btn'>分享</Button>
                    <Button onClick={rank} shape='circle' className='btn'>排行</Button>
                </div>
            </div>
            <Modal 
                title='排行榜' 
                visible={isRankModalVisible}
                onCancel={handleRankModalCancel}
                footer={<div className='modal-footer'>
                    <Button onClick={goPrevious} disabled={curPage === 1}>上一页</Button>
                    <Button onClick={goNext} disabled={!hasNextPage}>下一页</Button>
                </div>}
            >
                {
                    !!rankList.length
                        ? <Table className={curPage === 1 ? 'highlight' : ''} dataSource={rankList} columns={columns} pagination={false} />
                        : <p>没有内容哦</p>
                }
            </Modal>
            <Modal
                visible={isQrCodeModalVisible}
                footer={null}
                bodyStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
                onCancel={handleQrCodeModalCancel}
            >
                <div id='picArea'>
                    <div id='userInfo'>
                        <span>{name}</span>
                        <span>{score} points!</span>
                        <span>rank #{userRank}</span>
                    </div>
                    <img id='qrCode' alt='二维码' src={qrCodeURL} />
                </div>
                <a href={savePicURL} download='肥马' className='saveMeBtn'>点我保存图片</a>
            </Modal>
        </>
    )
}

type RankItem = {
    rank: number,
    mark: number,
    name: string
}

export default Gameover