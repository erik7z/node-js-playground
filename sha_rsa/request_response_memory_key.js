const axios = require('axios');
const  {createSign, createVerify} = require('crypto');


const OPERATOR_PRIVATE_KEY  = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCJnXi4yMt/LGu86Uz2H5XKdtRQCjMuU+UAhqE6+U6Y5U8ZBeq1
sLVrOFRMgaiX/EBbkJw7HsY37vC60gI2Iy+7rTNpuV+Tv1J0y7kVGAqzTgQWXHRU
orlLwKz0xuoiXQZ2KfWkLZ/5oakaXkU7q5MCGpTeX/+qDOoMLyyOXIe1wwIDAQAB
AoGAdTlQpodU4UXjmI5bYqTRIiBLBstJgcMxJVuJaAUKcK+Uy0oA/zhBsc3P8UPZ
a24THGx4yNuUGf1NzrYp8BfVBhWPUcYRwgWeqyuIpSVQVGY/9AJ+364iBX9NQ+6A
ATwZm855kZWFnXkOPJXAzILO7Me5Q3buzxGjoWP3k5LjEQECQQDTxmNlAVTIJ8ka
f/5+EY4F5qmS/sonaGCR/fhF8UdIQnCgsfF0+IeijH8I16rj/7kGLTaCOwNIraWj
h2khV/8DAkEAplp0rp3Nkt/wWR1Z2u1aQw9WKL7WbNFKtIIpCCPJwYXLXv8dTkd7
GcGADIlx++aGzMkdP+HOoeLRuUlXoCtSQQJBALu+QRemWncnbk2j8wXoojPxDZxX
bPgKvLIwqQ24nS0eWaLcnebI/dXJIEXCjKmcZ3dmVdCWaI7iAto6jaUV0ekCQA4F
idg+DNnYblXUl4JQh08nt8dvbnt1mKpmXjcFbTgWovG65yl19PZSzQxBeY4V/D6+
pOyBh/01NSA9AlnJzQECQBUIikGD2LxvcFovgQKm5/aToEJCOK2/pkeRzWmnmWQo
TKqcJOrgEQkvC3nD+8LZDFmnfZhjXLBP95bguZAJdPk=
-----END RSA PRIVATE KEY-----`;

const OPERATOR_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJnXi4yMt/LGu86Uz2H5XKdtRQ
CjMuU+UAhqE6+U6Y5U8ZBeq1sLVrOFRMgaiX/EBbkJw7HsY37vC60gI2Iy+7rTNp
uV+Tv1J0y7kVGAqzTgQWXHRUorlLwKz0xuoiXQZ2KfWkLZ/5oakaXkU7q5MCGpTe
X/+qDOoMLyyOXIe1wwIDAQAB
-----END PUBLIC KEY-----`;


function sign(message, digestType, privateKey) {
    return createSign(digestType).update(message).sign(privateKey, 'base64');
}

function isValid(message, signature, digestType, publicKey) {
    return createVerify(digestType).update(message).verify(publicKey, signature, 'base64');
}


async function fetchWithRsa() {

    const reqBody = {
        "operator_id": 1325
    }

    const reqBodyString = JSON.stringify(reqBody)

    const digestType = 'RSA-SHA256';

    const signature = sign(reqBodyString, digestType, OPERATOR_PRIVATE_KEY);
    const valid  = isValid(reqBodyString, signature, digestType, OPERATOR_PUBLIC_KEY);

    console.log(`
        Signature for: 
        '${reqBodyString}' 
        
        is:
        '${signature}'
        
        and validation check is:
        => ${valid}
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
