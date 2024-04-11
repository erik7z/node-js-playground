const fs         = require('fs');
const path       = require('path');
const axios = require('axios');

const {HmCrypto} = require('./lib');

function readPem(filename) {
    return fs.readFileSync(path.resolve(__dirname, './keys/' + filename)).toString('ascii');
}

async function fetchWithRsa() {
    const digestType = 'RSA-SHA256';
    const publicKey  = readPem('stg_pub.pem');
    const privateKey = readPem('stg_priv.pem');

    const hmCrypto = new HmCrypto(digestType, privateKey, publicKey);

    const reqBody = {
        "operator_id": 1325
    }

    const reqBodyString = JSON.stringify(reqBody)

    const signature = hmCrypto.sign(reqBodyString);
    const isValid  = hmCrypto.isValid(reqBodyString, signature);

    console.log(`
        Signature for: 
        '${reqBodyString}' 
        
        is:
        '${signature}'
        
        and validation check is:
        => ${isValid}
    `);


    const API_URL = 'https://api.server1.ih.testenv.io';
    const path = '/operator/generic/v2/game/list';

    const headers = {
        'X-Hub88-Signature': signature,
        'Content-Type': 'application/json'
    }


    try {
        const res = await axios.post(API_URL + path, reqBody, { headers });

        console.log(res.data);
        return res.data;
    } catch (e) {
        console.error(e.message);
        throw e;
    }


}

fetchWithRsa().then(console.log).catch(console.error)
