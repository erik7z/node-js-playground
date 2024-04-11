const fs = require('fs');
const forge = require('node-forge');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function fetchWithSSL() {
    // Load your certificates and keys
    const merchantCertificatePem = fs.readFileSync('MERCHANT_CERTIFICATE.pem', 'utf8');
    const merchantPrivateKeyPem = fs.readFileSync('MERCHANT_PRIVATE_KEY.pem', 'utf8');
    const inpayCertificatePem = fs.readFileSync('INPAY_CERTIFICATE.pem', 'utf8');



    const merchantCertificate = forge.pki.certificateFromPem(merchantCertificatePem);
    const merchantPrivateKey = forge.pki.privateKeyFromPem(merchantPrivateKeyPem);
    const inpayCertificate = forge.pki.certificateFromPem(inpayCertificatePem);

    const p7Sign = forge.pkcs7.createSignedData();
    p7Sign.content = forge.util.createBuffer('Hello Inpay', 'utf8');
    p7Sign.addCertificate(merchantCertificate);
    p7Sign.addSigner({
        key: merchantPrivateKey,
        certificate: merchantCertificate,
        digestAlgorithm: forge.pki.oids.sha256,
    });
    p7Sign.sign();

    const signedDataPem = forge.pkcs7.messageToPem(p7Sign);

    const p7Encrypt = forge.pkcs7.createEnvelopedData();
    p7Encrypt.addRecipient(inpayCertificate);
    p7Encrypt.content = forge.util.createBuffer(signedDataPem);
    p7Encrypt.encrypt();

    const encryptedDataPem = forge.pkcs7.messageToPem(p7Encrypt);

    const API_CLIENT_UUID = "b071731a-e750-44d4-86e4-b368bc61a108";
    const API_CLIENT_SECRET = "69b7d97fb458247c09707abe04cbc406";
    const API_URL = 'https://test-api.inpay.com';

    const headers = {
        'X-Auth-Uuid': API_CLIENT_UUID,
        'Authorization': 'Bearer ' + API_CLIENT_SECRET,
        'X-Request-ID': uuidv4(),
        'Content-Type': 'application/x-pkcs7-mime'
    };


    try {
        const res = await axios.post(API_URL + "/authorization/checks/encryption", encryptedDataPem, { headers });

        console.log(res.data);
        return res.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

fetchWithSSL().then(console.log);
