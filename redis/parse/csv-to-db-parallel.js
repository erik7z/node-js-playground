const mysql                              = require('mysql2/promise');
const {parse}                            = require('csv-parse');
const Redis                              = require('ioredis');
const fs                                 = require('fs');
const {Worker, isMainThread, workerData} = require('worker_threads');

const LOGS_PATH                    = '_logs';
const IMPORT_FILE_PATH         = '_for_import';
const IMPORT_FILE_NAME         = 'redis-export-redis_advabet_com-6379-2025-02-27_08_54_sorted';
// const IMPORT_FILE_NAME      = 'test';
const IMPORT_FILE_EXTENSION    = 'csv';

const WORKER_COUNT             = 60;
const BATCH_SIZE               = 10000;
const MONITORING_CHECK_TIMEOUT = 5000;


const REDIS_PENDING_JOBS_KEY   = 'pending_jobs';
const REDIS_PROCESSED_JOBS_KEY = 'processed_events';

const REDIS_HOST = 'redis.advabet.com';
const REDIS_PORT = 6379;

const dbConfig = {
    host    : 'db01.advabet.com',
    user    : 'nguita.e',
    password: 'Fjy3J&tgl6Hblhys',
    database: 'Grantor',
    port    : 3306
};

const DateTime = new Date().toISOString().replace(/T|:|\..+/g, '_').slice(0, -3);

const mainLogFile = fs.createWriteStream(`${LOGS_PATH}/${IMPORT_FILE_NAME}-main-${DateTime}.log`, { flags: 'a' });
const workersLogFile = fs.createWriteStream(`${LOGS_PATH}/${IMPORT_FILE_NAME}-workers-${DateTime}.log`, { flags: 'a' });

// const logFile = fs.createWriteStream(`${IMPORT_FILE_NAME}-${DateTime}.log`, {flags: 'a'});

// function log(message) {
//     const timestamp  = new Date().toISOString();
//     const logMessage = `[${timestamp}] ${message}\n`;
//     console.log(logMessage);
//     logFile.write(logMessage);
// }

// Separate logging functions for different contexts
function logMain(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${message} [${timestamp}]\n`;
    console.log(logMessage);
    mainLogFile.write(logMessage);
}

function logWorker(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${message} [${timestamp}]\n`;
    console.log(logMessage);
    workersLogFile.write(logMessage);
}

if (isMainThread) {
    async function distributeWork() {
        const redis = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT
        });

        const fileStream = fs.createReadStream(`${IMPORT_FILE_PATH}/${IMPORT_FILE_NAME}.${IMPORT_FILE_EXTENSION}`);
        const parser     = fileStream.pipe(parse({
            columns         : true,
            skip_empty_lines: true
        }));

        logMain('### Starting parallel import process...');
        await redis.del(REDIS_PROCESSED_JOBS_KEY);
        await redis.del(REDIS_PENDING_JOBS_KEY);

        let batch     = [];
        let totalJobs = 0;

        logMain('### Phase 1: Queueing jobs...');
        for await (const record of parser) {
            batch.push(record);
            if (batch.length >= BATCH_SIZE) {
                await redis.lpush(REDIS_PENDING_JOBS_KEY, JSON.stringify(batch));
                totalJobs += batch.length;
                logMain(`Queued batch of ${batch.length} jobs. Total queued: ${totalJobs}`);
                batch = [];
            }
        }

        if (batch.length > 0) {
            await redis.lpush(REDIS_PENDING_JOBS_KEY, JSON.stringify(batch));
            totalJobs += batch.length;
            logMain(`### Queued final batch of ${batch.length} jobs. Total queued: ${totalJobs}`);
        }

        logMain('### Phase 2: Starting workers...');
        const workers = [];
        for (let i = 0; i < WORKER_COUNT; i++) {
            const worker = new Worker(__filename, {
                workerData: {workerId: i}
            });
            workers.push(worker);
            logMain(`Started worker ${i}`);
        }

        const startTime       = Date.now();
        const monitorInterval = setInterval(async () => {
            const processed = await redis.scard(REDIS_PROCESSED_JOBS_KEY);
            const elapsed   = (Date.now() - startTime) / 1000;
            logMain(`### Progress: ${processed}/${totalJobs} events | Elapsed time: ${elapsed.toFixed(1)}s`);

            if (processed >= totalJobs) {
                clearInterval(monitorInterval);
                logMain('### All jobs completed. Shutting down...');

                await redis.quit();
                process.exit(0);
            }
        }, MONITORING_CHECK_TIMEOUT);

        process.on('SIGINT', async () => {
            clearInterval(monitorInterval);
            await redis.quit();
            process.exit(0);
        });
    }

    distributeWork();

} else {
    async function processJobs() {
        const redis    = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT
        });
        const pool     = mysql.createPool(dbConfig);
        const workerId = workerData.workerId;

        while (true) {
            const batch = await redis.brpop(REDIS_PENDING_JOBS_KEY, 5);
            if (!batch) {
                break;
            }

            const records = JSON.parse(batch[1]);
            for (const record of records) {
                const eventId      = record.key.split(':').pop();
                const lastHitValue = parseInt(record.value);

                try {
                    await pool.query('START TRANSACTION');

                    const [rows] = await pool.execute(
                        'SELECT event_id, data FROM Event WHERE event_id = ? FOR UPDATE',
                        [eventId]
                    );

                    if (rows.length === 0) {
                        logWorker(`EVENT [${eventId}] [X] not found in database [worker ${workerId}]`);
                        await pool.query('ROLLBACK');
                        continue;
                    }

                    const currentData = rows[0].data;
                    if (currentData && Object.keys(currentData).length > 0) {
                        logWorker(`EVENT [${eventId}] [*] have data: ${JSON.stringify(currentData)} [worker ${workerId}]`);
                    } else {
                        logWorker(`EVENT [${eventId}] [-] no data: ${JSON.stringify(currentData)} [worker ${workerId}]`);
                    }

                    await pool.execute(
                        'UPDATE Event SET data = JSON_SET(data, "$.last_hit", ?) WHERE event_id = ?',
                        [lastHitValue, eventId]
                    );

                    const [updatedRows] = await pool.execute(
                        'SELECT data FROM Event WHERE event_id = ?',
                        [eventId]
                    );

                    logWorker(`EVENT [${eventId}] [>] after update: ${JSON.stringify(updatedRows[0].data)} [worker ${workerId}]`);

                    await redis.sadd(REDIS_PROCESSED_JOBS_KEY, eventId);
                    await pool.query('COMMIT');

                } catch (error) {
                    await pool.query('ROLLBACK');
                    logWorker(`EVENT [${eventId}] [!] error: ${error.message} [worker ${workerId}]`);
                }
            }
        }

        await pool.end();
        await redis.quit();
        logWorker(`Worker ${workerId} finished processing`);
    }

    processJobs();
}
