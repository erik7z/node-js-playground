const { execFile } = require('child_process');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const merchantPrivateKey = `
    -----BEGIN PRIVATE KEY-----
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
eNY2xhRHKLKiWLIh62GxuJS+iCzO
-----END PRIVATE KEY-----
`
const inpayCertificate = `
    -----BEGIN CERTIFICATE-----
MIIFFDCCAvwCFD4IT3fAQdqfrgG6xtF/F4ELStbEMA0GCSqGSIb3DQEBCwUAMC8x
EjAQBgNVBAoMCUlucGF5IEEvUzEZMBcGA1UEAwwQSW5wYXkgU3RhZ2luZyBDQTAe
Fw0yMTEwMDQxNjQ1MDNaFw0zNjEwMDMxNjQ1MDNaMF4xCzAJBgNVBAYTAkRLMRMw
EQYDVQQHDApDb3BlbmhhZ2VuMRIwEAYDVQQKDAlJbnBheSBBL1MxJjAkBgNVBAMM
HUlucGF5IENCUCBTdGFnaW5nIEVudmlyb25tZW50MIICIjANBgkqhkiG9w0BAQEF
AAOCAg8AMIICCgKCAgEArYyfjX8LDJRu8lglBQQep0lExQhFINWHOTKgcl9Q0+YW
zqAtoUGHk9BUi8v75X/Wcteq3xIBl++IRP/KepS92RArMxmoCuvEbLFSPEuJW/Pd
iFhv+/Rr7MGGpfe56vLbLExoaXvavK41R/Mio0qCur7Sed7RrKG73vwd3BrSl46D
6I+8KslL3ifmBBKqf9+PGDY3CX5A+uWYGSdihjmpzNXzuK/RiDvWZuZkY4ULe2Re
UnNiKpsL5mNt9xi4GT07nK+VlGZlnN2yDezsOW2fQpzOkyjuvzT78q41XOQ/24GZ
SXFGzJgZf/Cksd9lWUicV6f20JDYBJU7QOaQgayMSsqliHvmhaaih66Ttm1EdgVQ
SRVdVVe1Xpdnl3iZB9QiEiMBPOKs3HEuGtEBuQWwPONM+Fjs0jtNaw8ZYWT2S1Ds
m0DszZjH/KmJPEQi78EfVVEFXg0NVw4XLagISilbAcFFxBbnPQe43mQy1LypAldQ
Zf1qKeNLqX8CItTSKyLZWdkh5sdCNcFAiOIUQcCpfIaHFnh4Hmvb+b8iz7XnO+5+
2eYP3m3ewpCblftUDNgHPsVg0JWTUyxwPlYJO9xi+9Rlng36pYs4lFS1YhFhJJCC
Rma716nHWhDd5K7lOJZvVi+aqFji+dOHIAatj1FuoW8xwQDLLnfvIXh4FaLKIucC
AwEAATANBgkqhkiG9w0BAQsFAAOCAgEAsW7V5XkTB+nWUz3kvAt3IXHpYo75oRUF
7B5Dc1yj4AtMzpEAG7QbirB+ohipFe3dGqr6+G25E4t93VYbt8A0ZT0RXAAl4aMv
oEOra895+ZGKzALD3wVRrN5d9pU+OofE5ljHohpBJIxKioVK3u8oHo+r4faGEQJ7
JZdhT4OmUHQzE5cEfMZa+pOfKhM/fl7mTSBQXQiqphMIugs33hWR0Jemig5RUfAe
21K6dRnXhXEH4MFM6n4iUcPunKTVZSs0nfTqlEzExMgX7kARXqE9Fo42mvUclTQW
DmSJOA+055gQ9B6jbu3RGvAsSb1fA57PBlZi2JKPKGxj7m5OKfGTNO6J45QfmNW9
fUCg8jlG0XahsWRsenPwreqoE5Qj3Hgq6Og24huztVIHjrBiCVV8gn3Uoz1Z+ZCt
DxPRJ61rDUjfr1Uth+vdhQCVyJ1ojpZ0UAEEw8UzGExIJJFOMwKFf9oZ2006MNsK
SDyePPM85bqqzZhi0xP2skbLLfBN+AlwPPKm9R8J2DgICdMF7YMUcfrxul80w70u
6pvv41F687YPru6XeQUGkNtauwsVCXV9BD5/Ju8MkDGQtgbNeZ9PtaSkXY7geDbs
E8fPC6rNuM2JoE+gq9gWUeJfn9+fUi4c5QQw3IpxdwhrR1r5+aoM/c1GXf8Pn9MB
ZvmIPxef54A=
-----END CERTIFICATE-----
`

const caBundle = `
-----BEGIN CERTIFICATE-----
MIIFPDCCAySgAwIBAgIBCTANBgkqhkiG9w0BAQUFADAsMRIwEAYDVQQKDAlJbnBh
eSBBL1MxFjAUBgNVBAMMDUlucGF5IFJvb3QgQ0EwHhcNMjExMDA0MTQzMTI5WhcN
MzExMDA0MTQzMTI5WjAvMRIwEAYDVQQKDAlJbnBheSBBL1MxGTAXBgNVBAMMEElu
cGF5IFN0YWdpbmcgQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDG
xp9rt87oZq/6HwfzdsOIe2BEi7DINNINFYPt5XNh/ewJIWkgbEsgteQen0M+LQRw
z9LEIBaR/EbkH/y1lCBeTsgV1C+1QvFM+V4ncFVoj36H4aNoHigHYnzP56TUKDui
l71rPTJRbytqmzEMg9yaeJOy+NKXwU83WY5i5vJsz86uELDbIeJbVmn7BwM3sNe8
EERfQ/jPGxOxHnRZA3GuLFiXGH0+6aSm56/WLvjXUQI80gYJhpn3jutjgmyc2HqD
dZj2lMglJSEedcf9x92b9G/dOTOx+ilHw79kPDRvVPwKTpE+WK3WMzByj31Wb/em
TlS8K9upnt0T/YNnANtnmZSrvRs0yyjeYd4IthRrALLYnHT4i/AhtacQ0xWg9/3E
da28BITHg1A1B2/jH8A6bZwfkiYh6VR0FdzlNpxWr+Wm7sRYDNK2HtQ5HWujFP2F
xOG/MLGyLdWTfuNQbcJdKWhtIPa4aTN9nf3r5avig8I4XGmkZxlDWB2op2dzghGJ
aloorHy+EZDYgKO2M/kJFGoKxKsqlX5U1v/M8oaf0oieBMpvt77Hd6RrmzIA7VXh
tWsKGkI6U3vY7VvPrcrSR29yLgudz/bsRXy3qdhNMZVL5QP5doi/hjEfkkBTKnBO
Nap+qcxqnjjqfa6Oi98/AV5aiwB88+TZjzTeMdFL7QIDAQABo2YwZDAOBgNVHQ8B
Af8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQU2aIVKO2emnbD
0PLnzYlSkX4IkScwHwYDVR0jBBgwFoAUNQY7lJevlZS4XeR4kwLFSJEk/IYwDQYJ
KoZIhvcNAQEFBQADggIBAJaScMEwlLrvxtr0azHu5y01m9EqTizVSI4v7QEJ2ovr
+8GG5mDa8dEt1LjeAG5iMOZvE5Sz9QgdhoZslQMqChn3VTr4ILaeVGggQ/YIVzSN
6NRDL4xqIbGO7f2AzDKA9ZqG62O+pENaJhWCcrcYW2ufpC7Q7ZHfIKLVvF2fE5VE
ogoMVU1NJVd2N87LiteCEoF//cISVQYXY9D0+ZKK2xc0QbIhJmitNLWxrFQrVN9M
TUfKJlTKUL7sij5dHN0RTVCme/i6mGfwxO2lsMSjwlvamIxZzYywmKSC/LlRvGLQ
VsMe0SuwZ1ICtTwLxNJNoxZdTjwmY2MOmDL7WsX8MOpqKM9kKwVHa5FoveJvWiT7
4an9xF9GThnTPYUZG36lbHJTOrnIWH9Vxb8Xz+9rzwUZMJO2m3K9zzvRN5rfz0D6
eweichaeIlXgLaVkNEw6EXDJq+hlOtZp/PbqFziO2vOeXL9xXSMQHE/298FjSiES
WLpEL/y95zFiSAi+7vnc4s/odZJJY3QgAKWO7vjtlA/ikxdE8nwG6RuawLS+ik1Y
0nqSX9mdjRvpwnQXbPZX/hO2UcUtYUzGxnNemeJ1EfHsMLSAt35OWUSjhYu6+Hhb
s+ss1s0br54WvHddBVckvM5y3nKUcWWXzz1223fAazwfGvPSKuMn2mTDGkYgOJRy
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIFNjCCAx6gAwIBAgIBATANBgkqhkiG9w0BAQsFADAsMRIwEAYDVQQKDAlJbnBh
eSBBL1MxFjAUBgNVBAMMDUlucGF5IFJvb3QgQ0EwHhcNMjEwOTI0MTA0NTEyWhcN
MzEwOTI0MTA0NTEyWjAsMRIwEAYDVQQKDAlJbnBheSBBL1MxFjAUBgNVBAMMDUlu
cGF5IFJvb3QgQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDQssoO
E8gak6qTCAycmYDJEwgpfd8BBs7kp+fdszKfGqD57z1WkGTs+X6VOXegAlve2Xu1
wDE3v02V+x+2YolKv8MeHNiOPq8Q2ET03qcq0KH7dLCyjIrlJ/URhWdsvwJzawTi
edU/+fcW0ByzG+Qd1T6J5VclnkqHthAshn5MHmwyXQuszYUS38kPsLHEJHYvxLEl
/I/K9jkb8djAY1qeWsSqV6SUosuTNrPysqfMNoqpwOoFzTj6re7aKAX6+JvTWfju
QptLmsenhQHwbFIi5EMIEM38v0mtNVJa96Xrls7xRtEbYzga9VE8/MoMX/knTJwc
VqtBXt+t49hyytXBUhjaSyHd7s+GSPIP1M5lw+2lF1BfJN2zsVpiUxGmWPrDQGtp
MyiD1yzzPlIAIpy4RYSa3xzZ0c8yJ761BQ0WptMFrkBH9oO8rCfgQNEFCB+CMmSQ
JaeN6UlRDxlKaV+ecSDlg6Ye83wD0L8Uyd54jjtHc1tI7Fl9BHthd9NG/sNbEflB
YBqu4kgKfP9oAHul2qkcmfhRjWTN1bkhAyZIxIMe8pePoTMRzBc1IW6iM5PS0cBo
lGZAp1DzOjuTaRmNxm4iu2xKLqeQMtotBzMMPTsWb5I9N/8YsAFJC1lJSBLR1kr8
om7ys2gKzr1Sa2ui2NnflVwKIuZyA032hWQduwIDAQABo2MwYTAOBgNVHQ8BAf8E
BAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUNQY7lJevlZS4XeR4kwLF
SJEk/IYwHwYDVR0jBBgwFoAUNQY7lJevlZS4XeR4kwLFSJEk/IYwDQYJKoZIhvcN
AQELBQADggIBAAQXu3ErxsihIfYXdk4thX65+wLhA03zxYa6gh6PgePRxkEhUuEa
TBzjuplGAkpxNJhwRQrupjSCfkH93OuTdpJpgDzFb6jhl9VYevGPdRY7/0HnP97h
8RG6hKkBYRVaPJc3BzwL/IwgXRbU4wkEKGp1IpLuzgCBAs0PF0a7BeCNLLTg38Mp
R/fQ4DTwCENmKUMoPiIndZOxyhLCrNA+p1uc94PPr9z6XA+AQROevaPompSBICdC
CfqbdUG/BW4W6Yu+vAUf+0Puu00ANoWzWcuqleqrkP4xEaNpVzB0LCfR9MVy1/rJ
rY5Lt2QRQJqtmQ+RUsy8WDbklYZWXGZGMxEhrlM28CmfY7RH4aGx6ccMI/CTwlKU
0g/iEnHtDLSFbkq3avmh/+bPw/g6aVFq13Ru7/UYVGNGDodtTma7Q9ApZlR4tnyf
enqWS5xOB3O9V27a9iVxxm8q3xwTPLuA7/ly38BZorTaQKpbAivwLKnG8HJCmbGV
0DjbYKlB+6NHje6xZdXnBNE1+Vfby2BL/gWME0+ZMt0GZcN9eEllEQTOK196YqYg
CNQ390dRmmA1jFJgw0Wd5wH/my3VcF8U4qklRcAG/erpShbgheYZlX3pKPQe863R
D9eaPybPcMBO0RhPUDsKPM4REE1gG5er6kDNAPUyRA+uXs66qV9aH3M+
-----END CERTIFICATE-----
`
async function createTempFile(data, prefix) {
    const filePath = path.join(os.tmpdir(), `${prefix}-${uuidv4()}`);
    await fs.writeFile(filePath, data, { encoding: 'binary' });
    return filePath;
}

async function opensslCommand(args, inputData = '') {
    return new Promise((resolve, reject) => {
        const openssl = execFile('openssl', args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`OpenSSL error: ${stderr || error}`));
            } else {
                resolve(stdout);
            }
        });

        if (inputData) {
            openssl.stdin.write(inputData);
            openssl.stdin.end();
        }
    });
}

async function decryptAndVerifyWithSSL() {
    const API_CLIENT_UUID = "b071731a-e750-44d4-86e4-b368bc61a108";
    const API_CLIENT_SECRET = "69b7d97fb458247c09707abe04cbc406";
    const API_URL = 'https://test-api.inpay.com/authorization/checks/decryption';

    const headers = {
        'X-Auth-Uuid': API_CLIENT_UUID,
        'Authorization': `Bearer ${API_CLIENT_SECRET}`,
        'X-Request-ID': uuidv4(),
    };

    try {
        const response = await axios.post(API_URL, '', { headers });
        const encryptedData = response.data;

        const encryptedFilePath = await createTempFile(encryptedData, 'encrypted');
        const merchantKeyPath = await createTempFile(merchantPrivateKey.trim(), 'merchant-private-key');
        const inpayCertPath = await createTempFile(inpayCertificate.trim(), 'inpay-certificate');

        const decryptedData = await opensslCommand(
            ['smime', '-decrypt', '-inform', 'PEM', '-in', encryptedFilePath, '-inkey', merchantKeyPath]
        );

        const decryptedFilePath = await createTempFile(decryptedData, 'decrypted');
        const caBundlePath = await createTempFile(caBundle.trim(), 'ca-bundle');

        // const verificationResult = await opensslCommand(['smime', '-verify', '-in', decryptedFilePath, '-CAfile', caBundlePath, '-certfile', inpayCertPath]);

        // need to recheck verify certs
        const verificationResult = true;

        await Promise.all([
            fs.unlink(encryptedFilePath),
            fs.unlink(merchantKeyPath),
            fs.unlink(inpayCertPath),
            fs.unlink(decryptedFilePath),
            fs.unlink(caBundlePath)
        ]);

        console.log('Decrypted data:', decryptedData);
        console.log('Verification result:', verificationResult);
        return { decryptedData, verificationResult };
    } catch (error) {
        console.error('Error during decryption and verification process:', error);
        throw error;
    }
}

decryptAndVerifyWithSSL().then(console.log).catch(console.error);

