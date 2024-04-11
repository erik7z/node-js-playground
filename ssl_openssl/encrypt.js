const { execFile } = require('child_process');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const merchantCertificate = `
    -----BEGIN CERTIFICATE-----
MIIE8TCCAtmgAwIBAgIEZao7AzANBgkqhkiG9w0BAQUFADAvMRIwEAYDVQQKDAlJ
bnBheSBBL1MxGTAXBgNVBAMMEElucGF5IFN0YWdpbmcgQ0EwHhcNMjQwMTE5MDkw
NDAzWhcNMzQwMTE5MDkwNDAzWjBGMUQwCQYDVQQGEwJDWTANBgNVBAgMBkN5cHJ1
czAOBgNVBAcMB3Vua25vd24wGAYDVQQKDBFBTFRBUFJJTUUgTElNSVRFRDCCAiIw
DQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANsvUiT3ILE1oDOmxP7AfgZM5wfS
dm5RWry/dy+N6PWRbWtWNhMunZV3affa3Zt860TM0rhsPjVBXIewE9Pbsin7j5dF
pI8U0C32F4AxvRHsQ74gwyx+QzMJhOfli4rkfTOr3tQRv1IX3KXjUvEWo07zn7VY
GWkd3DZvpIpEpLWG2Dd0fJVsWMwuEtSmiFCu+ShMM+Sh0qKniCBybrus1Y4H4EPd
ANan4e19WISzCFvFY/EQ71rwrvw5ReXLkb3EAtAW8cFS9Nojco0fRRaxcqx5kFeh
FQOqWpqHsLlHizad4fg4a/j2R1gj3JHyjAb0jiYQ86M6e8AbqKv61Ru+jKr3w1Ut
CzsKhY5ivOrNvAmCHH4o5aPysbdm/mgjcdwv5ifehZbt0JAEOv7GXj0zUnet4dLv
fGZ2X67li5kesFKJJpT4hWHS6JYac93Pm4Ck357DkZMAptyn5sskg20uoeFRb2lM
KQ6suSBZxAyuKT0PQJlcjOawmBQlyWGvfCnYEIMKV4+ObGvzEWWi+aUFpHbbin/C
z6icLMJE0bpCVFnj8TgTjKMAyEsT8oEX4kDj1rGlIJTVr3VXXoqTrmOAMcL6C72U
d/lTlk5Eg7Its4nzTcfft/VKWt4oAs4ckCVeZSgd6Zjo1Uy+8dUHrG+jFm6uZp3E
jptuAv3dGGUxMwwdAgMBAAEwDQYJKoZIhvcNAQEFBQADggIBAJwZxfLdu1S3qerO
Nzfgdbym5UYJ4eQN68GNyzuwTNaTyREctY2kyKcy7zBGxvPNwMK1Ge24TNiG8QjY
5Ts9dGrodyCsOvEJVcrDAzAV3ZfyjLIUaCyuz76b4Vof/g8vq3ugM4kSrRr+5yfF
D1Opvg7MYn/I62bCl1gisLn3ZcwpYJ7O1WWd8oDy1NlvkH8AGvbWWdZSNp0HJmYx
UQJgx32o6wASA4ScWnt0biRFfO/TGNkSAn4c8a+aXXEdYLcfkCQje5BWFEYyVbMY
09TqJc9EPIJP8SS23/uSrYdH4tmxxm6lNa9sCSV9O1Q1WmN8w4+P4CHcowOJn2F+
8pw7bMGvEAr7rR9H104VWJNqxe/azZII/gm+H3ukONKkPtjvedwR4mN+8SELWXfh
kKN3Hivzk4OlLgfEewW2N56wmtDBIxcyfXGIRVUbwHOS8Rhr5OrJTcIuo90+OeY5
zpnPc1lT2iA+PViR5OooEFD66Neh9c7rpcE3f5bujxqpyp1mXDz1PeOJAkg42yKs
F7W0J0KPPY95zK/yaJgBDhWCYtdoB/YM4TFOvrJu6oX4cGlTdk8IoHCXLlZR/9TF
6Dpj4LGAIroJI4W4Agpehei88cc6xldakg/xYFLoYU31evAIGUs/CJj4lcXt1iWS
4hGDyGC1Se1VHZeYXUua6Ta7fMz6
-----END CERTIFICATE-----
    `
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
async function createTempFile(data) {
    // Use os.tmpdir() to get the system's temporary directory
    const filePath = path.join(os.tmpdir(), `temp-${uuidv4()}`);
    await fs.writeFile(filePath, data, 'utf8');
    return filePath;
}

async function opensslCommand(args, inputData) {
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

async function fetchWithSSL() {
    const plaintextData = 'Hello Inpay';

    const merchantCertPath = await createTempFile(merchantCertificate.trim());
    const merchantKeyPath = await createTempFile(merchantPrivateKey.trim());
    const inpayCertPath = await createTempFile(inpayCertificate.trim());

    const signedData = await opensslCommand(
        ['smime', '-sign', '-nodetach', '-signer', merchantCertPath, '-inkey', merchantKeyPath, '-outform', 'PEM'],
        plaintextData
    );

    const encryptedData = await opensslCommand(
        ['smime', '-encrypt', '-outform', 'PEM', inpayCertPath],
        signedData
    );

    await Promise.all([
        fs.unlink(merchantCertPath),
        fs.unlink(merchantKeyPath),
        fs.unlink(inpayCertPath)
    ]);

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
        const res = await axios.post(API_URL + "/authorization/checks/encryption", encryptedData, { headers });

        console.log(res.data);
        return res.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

fetchWithSSL().then(console.log).catch(console.error);
