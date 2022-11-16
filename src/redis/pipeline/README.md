# [A Guide to NodeJS Redis Pipeline using IORedis Package](https://progressivecoder.com/a-guide-to-nodejs-redis-pipeline-using-ioredis-package/)

### Create a project and install the IORedis NPM package.

```shell
mkdir nodejs-redis-pipeline
npm init -y
npm install ioredis
```

### Create simple pipeline:

```js
// index.js 
const Redis = require('ioredis');

//  By default, it will connect to Redis instance on localhost port 6379. 
//  You can use Docker to create a Redis instance or install it locally.
const redis = new Redis()

async function main() {
    // we create a NodeJS Redis pipeline instance by calling the pipeline() function.
    const pipeline = redis.pipeline()
    
    // As you can see, each command performs a specific action. 
    // However, they are not sent to the Redis server as yet
    pipeline.set('foo', 'bar')
    pipeline.get('foo')
    pipeline.set('count', 1)
    pipeline.incr('count')
    pipeline.get('count')
    pipeline.del('foo')
    
    // Finally, we can send the commands by using the exec() function. 
    // Since it is an async operation, we use await to make the call.
    const results = await pipeline.exec()
    
    console.log(results)
    // Redis will execute the commands within the pipeline and return the results in an array
    /* result:
        [
          [ null, 'OK' ],
          [ null, 'bar' ],
          [ null, 'OK' ],
          [ null, 2 ],
          [ null, '2' ],
          [ null, 1 ]
        ]
     */
    
}

(async () => {
    await main()
})()
```

