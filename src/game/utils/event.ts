const EventUtil = {
    addHandler(element: any, type: string, handler: (...args: any[]) => void) {
        if (element.addEventListener)
            element.addEventListener(type, handler, false);
        else if (element.attachEvent)
            element.attachEvent("on" + type, handler);
        else
            element["on" + type] = handler;
    },
    removeHandler(element: any, type: string, handler: () => void) {
        if(element.removeEventListener)
            element.removeEventListener(type, handler, false);
        else if(element.detachEvent)
            element.detachEvent("on" + type, handler);
        else
            element["on" + type] = handler;
    },
    /**
     * 监听触摸的方向
     * target            要绑定监听的目标元素
     * isPreventDefault  是否屏蔽掉触摸滑动的默认行为（例如页面的上下滚动，缩放等）
     *  upCallback        向上滑动的监听回调（若不关心，可以不传，或传false）
     *  rightCallback     向右滑动的监听回调（若不关心，可以不传，或传false）
     *  downCallback      向下滑动的监听回调（若不关心，可以不传，或传false）
     *  leftCallback      向左滑动的监听回调（若不关心，可以不传，或传false）     */
    listenTouchDirection(
        target: any, 
        isPreventDefault: boolean,
        cb: {
            upCallback?: (...args: any[]) => void, 
            rightCallback?: (...args: any[]) => void, 
            downCallback?: (...args: any[]) => void, 
            leftCallback?: (...args: any[]) => void 
        }
    ) {
        const { upCallback, rightCallback, downCallback, leftCallback } = cb
        const handleTouchEvent = (event: TouchEvent) => {
            switch (event.type){
                case "touchstart":
                    startX = event.touches[0].pageX;
                    startY = event.touches[0].pageY;
                    break;
                case "touchend":
                    var spanX = event.changedTouches[0].pageX - startX;
                    var spanY = event.changedTouches[0].pageY - startY;
                    if(Math.abs(spanX) > Math.abs(spanY)){      //认定为水平方向滑动
                        if(spanX > 30){         //向右
                            if(rightCallback)
                                rightCallback(spanX);
                        } else if(spanX < -30){ //向左
                            if(leftCallback)
                                leftCallback(spanX);
                        }
                    } else {                                    //认定为垂直方向滑动
                        if(spanY > 30){         //向下
                            if(downCallback)
                                downCallback();
                        } else if (spanY < -30) {//向上
                            if(upCallback)
                                upCallback();
                        }
                    }
                    break;
                 case "touchmove":
                    //阻止默认行为
                    if(isPreventDefault)
                        event.preventDefault();
                    break; 
            }
        }
        this.addHandler(target, "touchstart", handleTouchEvent);
        this.addHandler(target, "touchend", handleTouchEvent);
        this.addHandler(target, "touchmove", handleTouchEvent);
        let startX: number
        let startY: number
    }
};

export { EventUtil }
// var warpOne = document.getElementById('warpOne');
// EventUtil.listenTouchDirection(warpOne, true, indexUp);	
// // warpOne 监听的dom 
// // 监听首页向上滑动
// function indexUp() {
// 	console.log("action:up");
// 	// 监听的回调
// }
