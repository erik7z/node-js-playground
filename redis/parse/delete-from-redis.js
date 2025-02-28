const Redis   = require('ioredis');
const fs      = require('fs');
const {parse} = require('csv-parse');

const filename  = 'redis-export-redis_advabet_com-6379-2025-02-27_08_54_sorted';
const filePath  = `_for_import/${filename}.csv`;
const LOGS_PATH = '_logs';
const DateTime  = new Date().toISOString().replace(/T|:|\..+/g, '_').slice(0, -3);
const logFile   = fs.createWriteStream(`${LOGS_PATH}/delete-from-redis-${filename}-${DateTime}.log`, {flags: 'a'});

function log(message, isError = false) {
    const timestamp  = new Date().toISOString();
    const logMessage = `[${timestamp}] ${isError ? 'ERROR: ' : ''}${message}\n`;
    console.log(logMessage);
    logFile.write(logMessage);
}

const redis = new Redis({
    host         : 'redis.advabet.com',
    port         : 6379,
    retryStrategy: (times) => Math.min(times * 10, 1000)
});

const BATCH_SIZE = 1000;

async function countTotalRecords(filename) {
    return new Promise((resolve) => {
        let count         = 0;
        const countStream = fs.createReadStream(filePath);
        const parser      = countStream.pipe(parse({columns: true}));
        parser.on('data', () => count++);
        parser.on('end', () => resolve(count));
    });
}
async function deleteKeysFromCSV() {
    const totalRecords = await countTotalRecords(filename);
    log(`Starting deletion of ${totalRecords} records`);

    const fileStream = fs.createReadStream(filePath);
    const parser     = fileStream.pipe(parse({
        columns         : true,
        skip_empty_lines: true
    }));

    let totalDeleted   = 0;
    let totalProcessed = 0;
    const startTime    = Date.now();
    let batch          = [];

    try {
        for await (const record of parser) {
            const key = record.key;
            batch.push(key);
            totalProcessed++;

            if (batch.length >= BATCH_SIZE) {
                await deleteBatch(batch);
                totalDeleted += batch.length;

                // Log progress after each batch
                const percent        = ((totalProcessed / totalRecords) * 100).toFixed(2);
                const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
                log(`Progress: ${totalProcessed}/${totalRecords} (${percent}%) | Elapsed time: ${elapsedSeconds}s`);

                batch = [];
            }
        }

        if (batch.length > 0) {
            await deleteBatch(batch);
            totalDeleted += batch.length;
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        log(`Deletion completed successfully! Deleted ${totalDeleted}/${totalRecords} keys in ${totalTime} seconds`);
    } catch (error) {
        log(`Error during deletion: ${error.message}`, true);
        process.exit(1);
    } finally {
        await redis.quit();
    }
}

async function deleteBatch(keys) {
    const pipeline = redis.pipeline();
    keys.forEach(key => pipeline.del(key));
    const results = await pipeline.exec();

    results.forEach(([error, result], index) => {
        if (error) {
            log(`Error deleting key ${keys[index]}: ${error.message}`, true);
        } else if (result === 1) {
            log(`Deleted key: ${keys[index]}`);
        } else {
            log(`Key not found or already deleted: ${keys[index]}`);
        }
    });
}

deleteKeysFromCSV();
