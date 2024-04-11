const fs         = require('fs');
const path       = require('path');
const {HmCrypto} = require('./lib');

// sync read, it's just example!
function readPem(filename) {
    return fs.readFileSync(path.resolve(__dirname, './keys/' + filename)).toString('ascii');
}

const digestType = 'RSA-SHA256';
const publicKey  = readPem('demo_pub.pem');
const privateKey = readPem('demo_priv.pem');

// init with default keypair and digest type
const hmCrypto = new HmCrypto(digestType, privateKey, publicKey);

const message = 'message';

// sign message
const signature = hmCrypto.sign(message);

console.log(`signature for '${message}' is '${signature}'"`);

// validate sign
const isTrue  = hmCrypto.isValid(message, signature);
const isFalse = hmCrypto.isValid('message 2 (invalid)', signature);

console.log(`'${message}' signature is '${signature}'" => ${isTrue}`);
console.log(`'message 2  (invalid)' signature is '${signature}'" => ${isFalse}`);
