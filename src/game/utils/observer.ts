// PS - publish--subsribe
interface PSOptions {
    listen(key: string, fn: () => void): void    
    trigger(): void
    remove(key: string, fn: () => void): void
}

class PBEvent implements PSOptions {
    private clientList: {
        [index: string]: Array<(...args: any[]) => void>
    } = {}

    listen(key: string, fn: (...args: any[]) => void): void {
        if (!this.clientList[key]) {
            this.clientList[key] = []
        }
        this.clientList[key].push(fn) // 订阅的消息添加进缓存列表
    }

    remove(key: string, fn: () => void) {
        const fns = this.clientList[key];
        if (!fns) { // 如果 key 对应的消息没有被人订阅，则直接返回
            return false;
        }
        if (!fn) { // 如果没有传入具体的回调函数，表示需要取消 key 对应消息的所有订阅
            fns && (fns.length = 0);
        } else {
            for (let l = fns.length - 1; l >= 0; l--) { // 反向遍历订阅的回调函数列表
                const _fn = fns[l];
                if (_fn === fn) {
                    fns.splice(l, 1); // 删除订阅者的回调函数
                }
            }
        }
    }

    trigger(...args: any[]) {
        var key = Array.prototype.shift.call(arguments), // (1); 
            fns = this.clientList[key];
        if (!fns || fns.length === 0) { // 如果没有绑定对应的消息
            return false;
        }
        for (var i = 0, fn; fn = fns[i++];) {
            fn.apply(this, [...arguments]); // (2) // arguments 是 trigger 时带上的参数
        }
    }
}

// const installEvent = (obj: object & {
//     [index: string]: any
// }) => { 
//     for (let i in PBEvent){ 
//         obj[ i ] = PBEvent[ i ]
//     } 
// }

export { PBEvent }