const amqplib = require('amqplib');
const {v4: uuidvv4} = require('uuid')


const client = async () => {
    const connection = await amqplib.connect('amqp://admin:admin@dc3-phd-rb-001-vs.dev-fuib.com:5672/development');
    const channel = await connection.createChannel();
    const q = await channel.assertQueue('', {exclusive: true});
    const uuid = uuidvv4();
    const msg = {session_id: "027794792721"}

    channel.sendToQueue(
        'transacter.input',
        Buffer.from(JSON.stringify(msg)),
        {
            replyTo: q.queue,
            correlationId: uuid,
            contentType: 'application/json',
            headers: {
                handler: "admin:findTransaction",
                contentType: "application/json",
            },
        },
    );

    channel.consume(q.queue, msg => {
        if (msg.properties.correlationId == uuid) {
            console.log(' [.] Got %s', msg.content.toString());
            setTimeout(() => {
                connection.close();
                process.exit(0);
            }, 500)
        }
    }, {noAck: true});
}

client();
