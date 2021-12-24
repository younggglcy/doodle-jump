import '../styles/gameover.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQrCode } from '../api/qrcode'
import { getAllRank } from '../api/user'
import { Modal, Button, Table, TableColumnsType } from 'antd'

const Gameover = () => {

    const navigate = useNavigate()

    const restart = () => {
        navigate('/')
    }

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

    const share = () => {
        const qrCodeURL = localStorage.getItem('qrCodeURL')
        if (!!qrCodeURL) {
            setQrCodeURL(qrCodeURL)
            setIsQrCodeModalVisible(true)
            return
        }
        getQrCode('Christmas-test').then(res => {
            return 'data:image/png;base64,' + btoa(
                new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), '')
            )
        }).then(data => {
            setQrCodeURL(data)
            localStorage.setItem('qrCodeURL', data)
            setIsQrCodeModalVisible(true)
        })
    }

    const handleQrCodeModalCancel = () => {
        setIsQrCodeModalVisible(false)
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
                    justifyContent: 'center'
                }}
                onCancel={handleQrCodeModalCancel}
            >
                <img alt='二维码' src={qrCodeURL} />
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