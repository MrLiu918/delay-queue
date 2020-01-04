const uuid = require('uuid');
const config = require("./config");
const redis = require('./tools/ioredisHelper');
const Kafka = require('./tools/kafkaHelper');

class Msg {
    constructor(msg){
        //处理消息是恢复的情况
        if(msg.guid){
            this.guid = msg.guid;
        }else{
            this.guid = uuid.v4();
        }
        this.delay = msg.delay||0;
        this.addTime = new Date().getTime();
        //消息已过期
        if(msg.runTime < this.addTime){
            this.delay = 0;
        }
        if(msg.delay != undefined){
            this.runTime = new Date().getTime() + this.delay;
        }
        this.data = msg.data;
        this.targetTopic = msg.targetTopic;
        //持久化
        (new redis()).hset(config.redisPersist,this.guid,JSON.stringify({
            guid:this.guid,delay:this.delay,addTime:this.addTime,runTime:this.runTime,data:this.data,targetTopic:this.targetTopic
        }));
    }

    run(){
        let that = this;
        let targetTopic = this.targetTopic||config.kafka_topics.defaultOut;
        let _msg = {
            topic:[targetTopic],
            messages:[JSON.stringify(this.data)],
            partition:0
        }
        var mq = new Kafka();
        mq.initProducer(function (producer){
            producer.createTopics([targetTopic], function (){
                producer.send([_msg], function (err, data){
                    if(!err){
                        //删除持久化数据
                        (new redis()).hdel(config.redisPersist, that.guid);
                    }
                })
            })
        });
    }
}

module.exports = Msg;