const ioredis = require('ioredis');
const redisConfig = require("../config").redisSettings;

function IoredisHelper(config) {
    if(!config) config = redisConfig;
    let client = new ioredis(config);
    return client;
}

module.exports = IoredisHelper;