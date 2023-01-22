const Redis = require('ioredis');

const redis = new Redis({
    port: 6379, // Redis port
    host: "127.0.0.1", // Redis host
    username: "default", // needs Redis >= 6
    password: "11111111",
})

async function main() {
    const currSecond = String(Math.round(Date.now() / 1000))
    const multi = redis.multi()

    multi.incr(currSecond)
        .expire(currSecond, 10)
        .get(currSecond)

    const [_, count] = (await multi.exec()).pop()

    console.log(count)
}

(async () => {
    await main()
    setTimeout(() => {
        process.exit(0);
    }, 500)
})()
