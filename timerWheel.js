const EventEmitter = require('events').EventEmitter;
const redis = require('./tools/ioredisHelper');
const Msg = require('./msg');
const config = require('./config');

class TimerWheel extends EventEmitter{
    constructor(length){
        super();
        //环形长度
        this.length = length;
        //当前指针
        this.curIndex = 0;
        //圈数
        this.round = 0;
        this.slot = [];
        this.toRun = [];
        for(let i = 0; i<this.length; i++){
            this.slot.push(new Map());
        }
    }

    add(data) {
        let _msg = new Msg(data);
        let delay = _msg.delay;
        let round = Math.floor(delay/this.length);
        let index = delay%this.length;
        index = this.curIndex + index;
        if(index>this.length-1){
            index = index - this.length;
        }
        _msg.round = round;
        _msg.index = index;
        this.slot[index].set(_msg.guid, _msg);
    }

    recover(){
        let that = this;
        let _redis = new redis();
        //恢复中断的数据
        _redis.hgetall(config.redisPersist).then(function (data) {
            for(let item in data){
                that.add(JSON.parse(data[item]));
            }
        })
    }

    next(){
        let cur = this.slot[this.curIndex];
        let toRun = [];
        cur.forEach(function (item) {
            if(item.round == 0){
                toRun.push(item);
                item.run();
                cur.delete(item.guid);
            }else {
                item.round--;
                cur.set(item.guid,item);
            }
        })
        this.emit('next',toRun);
        //推动指针移动
        if (this.curIndex >= this.length - 1) {
            this.round++;
            this.curIndex = 0;
            this.emit('round');
        } else {
            this.curIndex++;
        }
    }

    start(){
        let that = this;
        setInterval(function () {
            that.next();
        },1000);
    }

}

module.exports = TimerWheel;
