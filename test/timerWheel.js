'use strict';
const timer = require('../timerWheel');
const config = require('../config');
const kafkaHelper = require('../tools/kafkaHelper');


describe('Delay queue test', function () {
    this.timeout(60 * 60 * 1000);
    it('delay msg', function (done) {
        let _kafkaHelper = new kafkaHelper();
        //生产消息
        _kafkaHelper.initProducer(function (producer){
            producer.createTopics([config.kafka_topics.delayQueue], function (){
                let i = 0;
                setInterval(function(){

                    var _msg = {
                        topic:[config.kafka_topics.delayQueue],
                        messages:[JSON.stringify({
                            delay:i,
                            targetTopic:config.kafka_topics.defaultOut,
                            data:{task:'hi'},
                        })],
                        partition:0
                    }
                    i++;
                    producer.send([_msg], function (err, data){
                        console.log("生产者 产生消息  ",data);
                    })
                }, 5000);
            })
        });

        //延迟
        let _timer = new timer(10);
        _kafkaHelper.initConsumer([{'topic': config.kafka_topics.delayQueue, 'partition': 0}], {'autoCommit': true, groupId: 'delaygroup'}, function (message){
            _timer.add(JSON.parse(message.value));
        });
        _timer.recover();
        _timer.on('next',function (data) {
            let count = data.length;
            console.log(`有${count}个延时消息发送`);
        })
        _timer.start();

        //消费延迟次消息
        let _kafkaHelperCus = new kafkaHelper();
        _kafkaHelperCus.initConsumer([{'topic': config.kafka_topics.defaultOut, 'partition': 0}], {'autoCommit': true, groupId: 'cus'}, function (message){
            console.log('消费者 消费到延迟后的消息 '+message.value);
        });

    });
});