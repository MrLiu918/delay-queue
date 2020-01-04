const config = require('./config');
const timer = require('./timerWheel');
const kafkaHelper = require('./tools/kafkaHelper');

main();
function main(){
    let _kafkaHelper = new kafkaHelper();
    let _timer = new timer(60*60);
    _kafkaHelper.initConsumer([{'topic': config.kafka_topics.delayQueue, 'partition': 0}], {'autoCommit': true, groupId: 'delaygroup'}, function (message){
        _timer.add(JSON.parse(message.value));
    });
    _timer.recover();
    _timer.on('next',function (data) {
        let count = data.length;
        console.log(`有${count}个延时消息发送`);
    })
    _timer.start();
}



