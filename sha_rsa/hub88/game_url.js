const axios                      = require('axios');
const {createSign, createVerify} = require('crypto');
const fs                         = require('fs');
const path                       = require('path');

function readPem(filename) {
    return fs.readFileSync(path.resolve(__dirname, './keys/' + filename)).toString('ascii');
}

function sign(message, digestType, privateKey) {
    return createSign(digestType).update(message).sign(privateKey, 'base64');
}

function isValid(message, signature, digestType, publicKey) {
    return createVerify(digestType).update(message).verify(publicKey, signature, 'base64');
}

async function fetchWithRsa() {
    const OPERATOR_PRIVATE_KEY = readPem('stg_priv.pem');
    const OPERATOR_PUBLIC_KEY  = readPem('stg_pub.pem');

    const reqBody = {
        'user'          : 'john12345',
        'token'         : 'f562a685-a160-4d17-876d-ab3363db331c',
        'platform'      : 'GPL_DESKTOP',
        'operator_id'   : 1325,
        'meta'          : {
            'rating'  : 10,
            'oddsType': 'decimal'
        },
        'lobby_url'     : 'https://amazing-casino.com/lobby',
        'lang'          : 'en',
        'ip'            : '142.245.172.168',
        'game_code'     : 'evo_livebaccaratlobby',
        'deposit_url'   : 'https://amazing-casion.com/deposit',
        'currency'      : 'EUR',
        'country'       : 'EE'
    };

    const reqBodyString = JSON.stringify(reqBody);

    const digestType = 'RSA-SHA256';

    const signature = sign(reqBodyString, digestType, OPERATOR_PRIVATE_KEY);
    const valid     = isValid(reqBodyString, signature, digestType, OPERATOR_PUBLIC_KEY);

    console.log(`
        Signature for: 
        '${reqBodyString}' 
        
        is:
        '${signature}'
        
        and validation check is:
        => ${valid}
    `);

    const API_URL = 'https://api.server1.ih.testenv.io';
    const path    = '/operator/generic/v2/game/url';

    const headers = {
        'X-Hub88-Signature': signature,
        'Content-Type'     : 'application/json'
    };

    try {
        const retryAxios = getAxiosWithRetries();

        // const res = await axios.post(API_URL + path, reqBody, { headers });
        const res = await retryAxios.post(API_URL + path, reqBody, {headers});

        console.log(res.data);
        return res.data;
    } catch (e) {
        console.error(e.message);
        throw e;
    }

}

function getAxiosWithRetries(retryAfteSeconds = 10, statusCodes = [429], retryCountLimit = 5) {
    const retryAxios = axios.create();
    let retryCount   = 0;
    retryAxios.interceptors.response.use((res) => {
        retryCount = 0;
        return res;
    }, async (error) => {
        if (error.config && statusCodes.includes(Number(error.response?.status))) {
            if (retryCount >= retryCountLimit) {
                throw new Error(`
                    Retry limit exceeded! 
                    Original error: ${error.message}
                `);
            }
            await new Promise(resolve => setTimeout(resolve, retryAfteSeconds * 1000));
            retryCount++;
            console.log(`(${retryCount}) retrying....`);
            return retryAxios.request(error.config);
        }
        retryCount = 0;
        return Promise.reject(error);
    });
    return retryAxios;
}

fetchWithRsa().then(console.log).catch(console.error);
