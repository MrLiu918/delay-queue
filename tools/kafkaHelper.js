const kafka = require('kafka-node');
const config = require('../config');

let KafkaHelper = function(){
    this.config = config;
    const client = new kafka.KafkaClient(this.config.kafkaClientSettings);
    // client.on('connect',function () {
    //     console.log('client  connect...');
    // })
    // client.on('ready',function () {
    //     console.log('client  ready...');
    // })
    // client.on('close',function () {
    //     console.log('client  close...');
    // })
    this.client = client;
    this.consumers = [];
    this.producers = [];
}

KafkaHelper.prototype.initProducer = function (handler){
    let producer = new kafka.Producer(this.client);
    producer.on('ready', function(){
        if(!!handler){
            handler(producer);
        }
    });
    producer.on('error', function(err){
        console.error('producer error ',err.stack);
    });
    this.producers.push(producer);
    return producer;
}

KafkaHelper.prototype.initConsumer = function (topics, options, handler){
    let consumer = new kafka.Consumer(this.client, topics, options);
    if(!!handler){
        consumer.on('message', handler);
    }
    consumer.on('error', function(err){
        console.error('consumer error ',err.stack);
    });
    this.consumers.push(consumer);
    return consumer;
}

module.exports = KafkaHelper;