const fs = require('fs');
const forge = require('node-forge');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const recipientPrivateKeyPem = fs.readFileSync('MERCHANT_PRIVATE_KEY.pem', 'utf8');
const recipientCertificatePem = fs.readFileSync('MERCHANT_CERTIFICATE.pem', 'utf8');

const recipientPrivateKey = forge.pki.privateKeyFromPem(recipientPrivateKeyPem);
const recipientCertificate = forge.pki.certificateFromPem(recipientCertificatePem);

const caCertPem = fs.readFileSync('CA_BUNDLE.pem', 'utf8');
const caStore = forge.pki.createCaStore([forge.pki.certificateFromPem(caCertPem)]);


const API_CLIENT_UUID = "b071731a-e750-44d4-86e4-b368bc61a108";
const API_CLIENT_SECRET = "69b7d97fb458247c09707abe04cbc406";
const API_URL = 'https://test-api.inpay.com';

async function decryptWithSSL() {
    const headers = {
        'X-Auth-Uuid': API_CLIENT_UUID,
        'Authorization': 'Bearer ' + API_CLIENT_SECRET,
        'X-Request-ID': uuidv4(),
    };

    try {
        const response = await axios.post(API_URL + '/authorization/checks/decryption', 'Banana', { headers });
        const encryptedDataPem = response.data;

        const p7Encrypted = forge.pkcs7.messageFromPem(encryptedDataPem);
        const recipient = p7Encrypted.findRecipient(recipientCertificate);
        p7Encrypted.decrypt(recipient, recipientPrivateKey);

        const verified = forge.pki.verifyCertificateChain(caStore, [recipientCertificate]);
        if (!verified) {
            throw new Error('Certificate verification failed.');
        }

        return p7Encrypted.content.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

decryptWithSSL().then(console.log).catch(console.error);
