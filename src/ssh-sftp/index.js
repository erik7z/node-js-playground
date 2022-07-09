
let Client = require('ssh2-sftp-client');
let sftp = new Client();

async function go() {
    const connection = await sftp.connect({
        host: '46.229.215.8',
        port: '22',
        username: 'root',
        password: 'Cr3wsilent*',
    });

    console.log('Connected')

    const saveFile = await sftp.put('./test.txt', '/root/askseaman.com/bananas/test.txt', {
        flags: 'w'
    });


    console.log('savefile: %o', saveFile)

    const uploadDir = await sftp.uploadDir('./test.txt', '/root/askseaman.com/bananas', {
        flags: 'w'
    });


    const dir = await sftp.list('/root/askseaman.com');

    console.log('dir: %o', dir)

    await sftp.end()

}

go();


