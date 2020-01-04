var config = {
    redisSettings: {
        host: "127.0.0.1",
        port: 6379,
        expires: 60 * 60,
    },

    redisPersist:'delayMsg',

    kafka_topics:{
        delayQueue:'delayQueue',
        defaultOut:'defaultOut'
    },

    kafkaClientSettings:{
        kafkaHost:'127.0.0.1:9092',
    }

}

module.exports = config;