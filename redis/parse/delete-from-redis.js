const Redis = require('ioredis');
const fs = require('fs');
const { parse } = require('csv-parse');

const filename = 'redis-export-redis_whitelabels_tech-16379-sorted_by_key';
const LOGS_PATH = '_logs';
const DateTime = new Date().toISOString().replace(/T|:|\..+/g, '_').slice(0, -3);
const logFile = fs.createWriteStream(`${LOGS_PATH}/delete-from-redis-${filename}-${DateTime}.log`, { flags: 'a' });

function log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${isError ? 'ERROR: ' : ''}${message}\n`;
    console.log(logMessage);
    logFile.write(logMessage);
}

const redis = new Redis({
    host: 'redis.whitelabels.tech',
    port: 16379,
    retryStrategy: (times) => Math.min(times * 10, 1000)
});

async function deleteKeysFromCSV() {
    const fileStream = fs.createReadStream(`_for_import/${filename}.csv`);
    const parser = fileStream.pipe(parse({
        columns: true,
        skip_empty_lines: true
    }));

    let totalDeleted = 0;
    const startTime = Date.now();

    try {
        for await (const record of parser) {
            const key = record.key;

            const redis_record = await redis.get(key);

            if (!redis_record) {
                log(`Key not found: ${key}`);
                continue;
            }

            const result = await redis.del(key);
            if (result === 1) {
                totalDeleted++;
                log(`Deleted key: ${key}`);
            } else {
                log(`Key not found or already deleted: ${key}`);
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        log(`Deletion completed successfully! Deleted ${totalDeleted} keys in ${totalTime} seconds`);
    } catch (error) {
        log(`Error during deletion: ${error.message}`, true);
        process.exit(1);
    } finally {
        await redis.quit();
    }
}

deleteKeysFromCSV();
