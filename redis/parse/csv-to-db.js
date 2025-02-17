const mysql   = require('mysql2/promise');
const {parse} = require('csv-parse');
const fs      = require('fs');

const dbConfig = {
    host: 'db-master.whitelabels.tech',
    user: 'nguita.e',
    // password: 'O04w$HH82W4e&w!8', DEV
    password: 'Fjy3J&tgl6Hblhys', // PROD
    database: 'Grantor',
    port    : 3306
};

const IMPORT_FILE_PATH      = '_for_import';
const IMPORT_FILE_NAME      = 'redis-export-redis_whitelabels_tech-16379-sorted_by_key';
const IMPORT_FILE_EXTENSION = 'csv';

const logFile = fs.createWriteStream(`${IMPORT_FILE_NAME}.log`, {flags: 'a'});

function log(message) {
    const timestamp  = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    console.log(logMessage);

    logFile.write(logMessage);
}

async function processCSVAndUpdateDB() {
    const pool       = mysql.createPool(dbConfig);
    const fileStream = fs.createReadStream(`${IMPORT_FILE_PATH}/${IMPORT_FILE_NAME}.${IMPORT_FILE_EXTENSION}`);
    const parser     = fileStream.pipe(parse({
        columns         : true,
        skip_empty_lines: true
    }));

    let processed   = 0;
    const startTime = Date.now();

    try {
        for await (const record of parser) {
            const eventId      = record.key.split(':').pop();
            const lastHitValue = parseInt(record.value);

            await pool.query('START TRANSACTION');

            const [rows] = await pool.execute(
                'SELECT event_id, data FROM Event WHERE event_id = ? FOR UPDATE',
                [eventId]
            );

            if (rows.length === 0) {
                log(`[X] EVENT ${eventId} not found in database`);
                await pool.query('ROLLBACK');
                notFound++;
                continue;
            }

            const currentData = rows[0].data;

            if (currentData && Object.keys(currentData).length > 0) {
                log(`[*] EVENT ${eventId} have data: ${JSON.stringify(currentData)}`);
            } else {
                log(`[+] EVENT ${eventId} have no data`);
            }

            const updateQuery = `
                UPDATE Event
                SET data = JSON_SET(data, '$.last_hit', ?)
                WHERE event_id = ?
            `;

            await pool.execute(updateQuery, [lastHitValue, eventId]);

            const [updatedRows] = await pool.execute(
                'SELECT data FROM Event WHERE event_id = ?',
                [eventId]
            );

            log(`[>] after update: ${JSON.stringify(updatedRows[0].data)}`);

            await pool.query('COMMIT');

            processed++;
            if (processed % 100 === 0) {
                const elapsedSeconds = (Date.now() - startTime) / 1000;
                log(`Processed ${processed} records | Elapsed time: ${elapsedSeconds.toFixed(1)}s`);
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Update completed successfully! Processed ${processed} records in ${totalTime} seconds`);
    } catch (error) {
        console.error('Error during update:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

processCSVAndUpdateDB();
