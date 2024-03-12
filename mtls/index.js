const https = require('https');
const axios = require('axios');
const fs    = require('fs');

async function fetchWithMtls() {
    const cert = fs.readFileSync('iovation-dev.crt');
    const key  = fs.readFileSync('iovation-dev.pem');

    const httpsAgent = new https.Agent({
        cert: `-----BEGIN CERTIFICATE-----
MIIEJzCCAw+gAwIBAgIUWB2jaOpY+8hLqL94+uBj4uUKP94wDQYJKoZIhvcNAQEL
BQAwgagxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQH
Ew1TYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBDbG91ZGZsYXJlLCBJbmMuMRswGQYD
VQQLExJ3d3cuY2xvdWRmbGFyZS5jb20xNDAyBgNVBAMTK01hbmFnZWQgQ0EgNmJl
ZDU0NTMxY2RkOTYxZGY1M2M5OTEyYTVlZjU0MjIwHhcNMjMwNjA1MjM0NTAwWhcN
MzMwNjAyMjM0NTAwWjA0MQswCQYDVQQGEwJVUzETMBEGA1UEChMKVHJhbnNVbmlv
bjEQMA4GA1UEAxMHMTA2NzYwMjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAPAsz6Njpze22qyamVcVjTtxcK62C65faW2Yw5YFfeEArp0hDOa5iIwQujST
yrTUg0KCHeeL03QT5zkiD6WDMNSJRv7/k5iWyokDMjl2AA8HwLPz75ip/AwUh1qZ
TtnMXzVsg4E5G2zkSuQ/dSkusgNQhaOofbA/W7+V49JmuJfQsViquf/vLmc77XkP
yohe6GrctuUg3H4NxYm9GqluLw/gcsiYWCEJmsG1GNdJf9Z2y6WNyHm4uwymWkSz
nsNjGYu3yOQTzezlCuY+OPRK7wBQVH7nY5CG4Qq8kH6UoGfqiLuKn9FpJ3UVZ3k1
dihQHuTYO8FQ+u75go9iVOfF9wsCAwEAAaOBuzCBuDATBgNVHSUEDDAKBggrBgEF
BQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRcR/0nit9rlom4Ipk6txNY4bSq
CjAfBgNVHSMEGDAWgBSo5GIJlQ0TARZeYecXmkWtZf9ksDBTBgNVHR8ETDBKMEig
RqBEhkJodHRwOi8vY3JsLmNsb3VkZmxhcmUuY29tLzZhOWY2MTNjLTgwZDItNDJl
Yy05Yjc2LWNiMWEzMjQyZTdkYi5jcmwwDQYJKoZIhvcNAQELBQADggEBAC5Bkzae
ySPojl5UwuRE0MK/NmnNRZjmRRPezuZ0CfexFbkk9gqpYhHsBHvsMFLkHNHtxkIs
BlSWyLdAJS8W1HCxPZf/yDUHIG5rwc/n0xkP23XYU5ntXHsJhhSPRXCD2a18QedL
OVt3LTN75J7/SXLla6fcYECO+b/QsudGdi/EBZkqlbik2xWEOQpLDkkb3m28kNq1
JLtP7OsrJs/9TWR8BgirMqu8KBQOXFtJPjsXDjrUZJ35M6MxAxzbJCBUDdBkGMvJ
mId5f6o6qQvd+SVBSAp1AKot4z+z75zJuAA2l+Bj5pgAbfD9FcvyGWoWndMrs8O2
6aeG99tdarxXaOg=
-----END CERTIFICATE-----`,
        key: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA8CzPo2OnN7barJqZVxWNO3FwrrYLrl9pbZjDlgV94QCunSEM
5rmIjBC6NJPKtNSDQoId54vTdBPnOSIPpYMw1IlG/v+TmJbKiQMyOXYADwfAs/Pv
mKn8DBSHWplO2cxfNWyDgTkbbORK5D91KS6yA1CFo6h9sD9bv5Xj0ma4l9CxWKq5
/+8uZzvteQ/KiF7oaty25SDcfg3Fib0aqW4vD+ByyJhYIQmawbUY10l/1nbLpY3I
ebi7DKZaRLOew2MZi7fI5BPN7OUK5j449ErvAFBUfudjkIbhCryQfpSgZ+qIu4qf
0WkndRVneTV2KFAe5Ng7wVD67vmCj2JU58X3CwIDAQABAoIBAANAQAeqQI5/AaLz
efh7skxn/GP8OXINsl7vtSBxofx3mcvgfiaDXWdNjkLjuz5kxmmrwQOsDChjYPsp
5fdSEsk8GhA3XZ3KClZkPi8Yu01FlOSt4rdFmcOzsjwjAulTNfi1p52j31l2fGyh
ghCU8SDqKDaIzQa9Nmmd+eL65ywnrTOU5OltDXnH/LfC7lhBA/m/EPznFwURLG/c
PIvTSkuWyDxx3296Rl07LGy8nGyxpSsRI79ML66uhcHfhEqNCeQ3T8x5NLt4xTsW
ON28ycFTFoydugOi8SgzzoIiWQfiuBFswxUrPOS5rYYF4v4qIwKPPpUJHLo4UB8k
3DNjkeECgYEA98s9r0SPFpziTmWW7yaHNyGR46JoaTT2cEfb3cwINKOReMJMYFUZ
ftBzNr5DZelw5rYjqgZe27NuFuzK3njQUyyGOEIFYqqkLepqTQfsu6OJuU/ZnQPA
a9M57NkiH1RAUuqLE0e807+wqwSSEW36RKuWxEa6Kmrt6lCPqTuanqsCgYEA+CD6
gZBM7kD/EKW9Vdw2Vqdxr+sdITJaVx+TQug9DS/UF3sclrQZIh3GRJZffGNg89KN
3rihL8GgfLbq3jn4qRgOuqA1QqIPt5iR0kBUTe/hvYYRX8Sg1C0LmLnkNxM3tvj1
PpVMCdevaCHQCEfYyfLiT0GnXGGxSShny9XKiSECgYEAo1tshhBXmJvCodZdY7nt
qE3MRNp7pOgSk0D8VMM+oZ03uPm2qkdP8IdxfSR/gD8efCqVZnCeto4axKhEsdfJ
1xtiPNJhhINkixSgEbpoueb9U5qtptKjVzJAXMFkumyrnz4ag5JmjN4xlP0FYtIz
DHRmh2ztLCukPzXvD61IqNMCgYAG/ycRMDh7H2oR1hqYqTT/DImwJDkWDo1tl35X
jKTsEkUwxE/yD/IFfEFy/aqDn2nEdlN5zEr/Rb54xc+ppIjWe88uhAX8cwVub+bs
vtOhvvnmljk3Mhw2325MSDGfO/N+PVbtBNi4DlTr4sgy85OxXh/zjC5j9H1DSthi
bwzfAQKBgFY6b9c+Sq5AFeFwBAhvMh49pcpRWz7Lh+8gMn2dcEdtsKECv9Vt0Stp
ALUNtA3pmXheLrLIije0T5H0f9IU59zeujAbfRKDqbMXIm6YCFS75ol3gyaVFbue
jUFUrqbY1Su6sgrzuxUT9gGlEPHmkNFudbuLGqUopHf0OrloC7p3
-----END RSA PRIVATE KEY-----`
    });

    try {
        const res = await axios.post('https://mtls-ci-api.iovation.com/fraud/v1/subs/1067602/checks', {
            'accountCode': 49845,
            'statedIp'   : '',
            'type'       : 'ds_registration',
        }, {
            auth: {
                username: '1067602/OLTP',
                password: 'QW7DW6W7RBQKQSXBDYR25GXJ2UF76JMN',
            },
            httpsAgent
        });

        console.log(res.data);
        return res.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

fetchWithMtls().then(console.log);
