const amqplib = require('amqplib');

const queueName = "journey_poc";
const msg = JSON.stringify({
    "event_type": "bonus_status_change",
    "service": "prewager",
    "user_id": 55189,
    "status": "success",
    "request_id": "3c524384fc969c69afe49cf804bca507",
    "partner_id": null,
    "cashdesk_id": null,
    "time_stamp": 1715690001,
    "data": {
        "version": 1,
        "type": "PWB",
        "status_from": {"name": "potential"},
        "status_to": {"name": "cancelled_by_manager"},
        "bonus_state": {
            "campaign_id": 2619,
            "bonus_id": 554046,
            "user_id": 55189,
            "status": "cancelled_by_manager",
            "currency": "USD",
            "bonus_amount": null,
            "wagered_amount": 0,
            "amount_for_wager": 0,
            "wagered_percent": 0,
            "comment": "Prewager_Journey_Perf_Test",
            "activation_expired_at": "2024-05-24T12:28:36.000Z",
            "activated_at": null,
            "deactivated_at": "2024-05-14T12:33:18.000Z",
            "created_at": "2024-05-14T12:28:36.000Z",
            "updated_at": "2024-05-14T12:33:18.000Z"
        }
    }
});

let count = 0;

async function start() {
    const connection = await amqplib.connect('amqp://guest:guest@127.0.0.1:50030');
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, {durable: true});

    for await (const _ of Array(2_000)) {

        await channel.sendToQueue(queueName, Buffer.from(msg));
        count++;
        console.log(count);
    }


    await new Promise(resolve => setTimeout(resolve, 1000));
    await channel.close();
    await connection.close();
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(0);
}

start()



