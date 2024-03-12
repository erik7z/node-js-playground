const amqplib = require('amqplib');

const queueName = "crm_node_consume";
const msg = JSON.stringify({
    "object_type": "operation",
    "action": "store",
    "data": {
        "__record": "operation",
        "amount": -30,
        "balance": 40747.31,
        "cashdesk": -149,
        "client_ip": "10.110.16.28",
        "comment": "{\"comment\":\"Withdrawal for object_id: 18441\",\"amount\":300,\"currency\":\"UAH\",\"type\":\"bet\",\"game_id\":\"forest\"}",
        "currency": "UAH",
        "data": null,
        "deposit_rest": 40747.31,
        "dt": "2023-05-16 09:04:21",
        "dt_done": "2023-05-16 09:04:21",
        "fee": null,
        "hash": null,
        "internal_game_id": 9461,
        "move": 1,
        "object_id": 18441,
        "operation_id": 1356660,
        "partner_id": 58,
        "payment_instrument_id": 0,
        "service_id": 185,
        "staff_id": null,
        "status": "completed",
        "tax_rate": null,
        "tax_sum": null,
        "tax_type": 0,
        "user_id": 34914,
        "wallet_account_id": "single_wallet",
        "wallet_id": "37958",
        "window": null
    }
});

let count = 0;

async function start() {
    const connection = await amqplib.connect('amqp://crm:Test0000@sw1rr01d.dev.favorit.:5672/master');
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, {durable: true});

    for await (const _ of Array(100_000)) {

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



