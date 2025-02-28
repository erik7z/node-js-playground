const Redis = require('ioredis');
const fs = require('fs');
const { Transform } = require('stream');

const host = 'redis.advabet.com'
const port = 6379;

const redis = new Redis({
    host,
    port,
    retryStrategy: (times) => Math.min(times * 50, 2000)
});

const DateTime = new Date().toISOString().replace(/T|:|\..+/g,'_').slice(0,-3);

const path =`_exports/redis-export-${host.replaceAll('.','_')}-${port}-${DateTime}.csv`


const writeStream = fs.createWriteStream(path);
writeStream.write('key,value\n');

const csvTransform = new Transform({
    objectMode: true,
    transform(data, encoding, callback) {
        const { key, value } = data;
        const csvLine = `${key},${value.replace(/,/g, ';')}\n`;
        callback(null, csvLine);
    }
});

async function* scanKeys() {
    let cursor = '0';
    let totalProcessed = 0;
    let startTime = Date.now();

    do {
        const [nextCursor, keys] = await redis.scan(cursor, 'COUNT', 1000);
        cursor = nextCursor;

        const pipeline = redis.pipeline();
        keys.forEach(key => {
            pipeline.ttl(key);
            pipeline.get(key);
        });

        const results = await pipeline.exec();

        for (let i = 0; i < keys.length; i++) {
            const ttl = results[i * 2][1];
            if (ttl === -1) {
                const value = results[i * 2 + 1][1];
                yield { key: keys[i], value };
            }
        }

        totalProcessed += keys.length;
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        console.log(`Processed ${totalProcessed} keys | Current cursor: ${cursor} | Elapsed time: ${elapsedSeconds.toFixed(1)}s`);
    } while (cursor !== '0');
}

async function exportToCSV() {
    try {
        console.log('Starting Redis export...');
        const startTime = Date.now();

        csvTransform.pipe(writeStream);

        for await (const data of scanKeys()) {
            csvTransform.write(data);
        }

        csvTransform.end();
        await new Promise(resolve => writeStream.on('finish', resolve));
        await redis.quit();

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Export completed successfully in ${totalTime} seconds`);
    } catch (error) {
        console.error('Export failed:', error);
        process.exit(1);
    }
}

exportToCSV();
