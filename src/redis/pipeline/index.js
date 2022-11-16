const Redis = require('ioredis');

const redis = new Redis({
    port: 6379, // Redis port
    host: "127.0.0.1", // Redis host
    username: "default", // needs Redis >= 6
    password: "11111111",
})

async function main() {
    const pipeline = redis.pipeline()

    pipeline.get('count')
    pipeline.incr('count')
    pipeline.expire('count', 20)

    const results = await pipeline.exec()

    console.log(results)
}

(async () => {
    await main()
    setTimeout(() => {
        process.exit(0);
    }, 500)
})()
