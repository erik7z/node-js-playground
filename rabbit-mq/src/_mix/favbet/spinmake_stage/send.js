const amqplib = require('amqplib');

const queueName = "crm_node_consume";
const msg = JSON.stringify({
    "object_type": "operation",
    "action": "store",
    "data": {
        "__record": "operation",
        "amount": -12,
        "balance": 83345.07,
        "cashdesk": -149,
        "client_ip": null,
        "comment": "{\"comment\":\"Withdrawal for object_id: 30408791\",\"amount\":\"12.00\",\"currency\":\"UAH\",\"type\":\"bet\",\"game_id\":\"6wildsharks\"}",
        "currency": "UAH",
        "data": null,
        "deposit_rest": 83345.07,
        "dt": "2023-11-27 16:00:32",
        "dt_done": "2023-11-27 11:00:32",
        "fee": null,
        "hash": null,
        "internal_game_id": 40,
        "move": 1,
        "object_id": 30408791,
        "operation_id": 2275808438,
        "partner_id": 58,
        "payment_instrument_id": 0,
        "service_id": 161,
        "staff_id": null,
        "status": "completed",
        "tax_rate": null,
        "tax_sum": null,
        "tax_type": null,
        "user_id": 3240720,
        "wallet_account_id": "single_wallet",
        "wallet_id": "4018",
        "window": null
    }
});

const sendMsg = async () => {
    const connection = await amqplib.connect('amqp://octopus_mq_user:uERdAWFCgExuuW7R@de2rmq01t.ctst.favorit:5672/master');
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, {durable: true});
    // channel.sendToQueue(queueName, Buffer.from(msg));
    console.log('Sent: ', msg);
    setTimeout(() => {
        connection.close();
        // process.exit(0);
    }, 10)
}

let count = 0;

async function start() {
    for await (const _ of Array(5)) {
        await sendMsg();
        count++;
        console.log(count);
        console.log('sleep 0.1 sec');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

start()



