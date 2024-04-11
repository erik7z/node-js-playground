const  {createSign, createVerify} = require('crypto');

class HmCrypto {
    defaultDigestType;
    defaultPrivateKey;ƒ
    defaultPublicKey;

    constructor(digestType, privateKey, publicKey) {
        this.defaultDigestType = digestType;
        this.defaultPrivateKey = privateKey;
        this.defaultPublicKey  = publicKey;
    }

    sign(message, digestType, privateKey) {
        digestType = digestType || this.defaultDigestType;
        privateKey = privateKey || this.defaultPrivateKey;

        return createSign(digestType).update(message).sign(privateKey, 'base64');
    }

    isValid(message, signature, digestType, publicKey) {
        digestType = digestType || this.defaultDigestType;
        publicKey  = publicKey || this.defaultPublicKey;

        return createVerify(digestType).update(message).verify(publicKey, signature, 'base64');
    }
}

module.exports = {
    HmCrypto
}
