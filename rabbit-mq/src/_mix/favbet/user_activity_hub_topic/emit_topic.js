const amqplib = require('amqplib');

const exchangeName = "user_activity_hub.v2.out";

const msg = JSON.stringify({
    "request_id": "e865f3150e22944f344b508cc745393b",
    "user_id": 27745,
    "partner_id": 58,
    "cashdesk_id": -149,
    "time_stamp": 1666192465,
    "event_type": "account_status_changed",
    "version": "2",
    "data": {
        "date": "2022-12-23 10:37:55",
        "user_id": 27745,
        "status":
            [
                {"alias": "IS_DOCUMENTS_UPLOAD", "shift": 37, "value": true},
                {"alias": "NEED_TO_CHANGE_PASSWORD", "shift": 25, "value": false}
            ]
    }
})

const routingKey = "account_status_changed"

const sendMsg = async () => {
    const connection = await amqplib.connect('amqp://master:ffKi37ZdEXIumu3V@de2rmq01d.dev.favorit:5672/master');
    const channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, 'topic', {durable: true});

    channel.publish(exchangeName, routingKey, Buffer.from(msg));

    console.log('Sent: ', msg);
    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500)
}

sendMsg();
