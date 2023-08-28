const amqplib = require('amqplib');

const queueName = "crm_node_consume";
const msg = JSON.stringify({"object_type": "operation", "action": "store", "data": {"__record": "operation", "amount": -30, "balance": 40747.31, "cashdesk": -149, "client_ip": "10.110.16.28", "comment": "{\"comment\":\"Withdrawal for object_id: 18441\",\"amount\":300,\"currency\":\"UAH\",\"type\":\"bet\",\"game_id\":\"forest\"}", "currency": "UAH", "data": null, "deposit_rest": 40747.31, "dt": "2023-05-16 09:04:21", "dt_done": "2023-05-16 09:04:21", "fee": null, "hash": null, "internal_game_id": 9461, "move": 1, "object_id": 18441, "operation_id": 1356660, "partner_id": 58, "payment_instrument_id": 0, "service_id": 185, "staff_id": null, "status": "completed", "tax_rate": null, "tax_sum": null, "tax_type": 0, "user_id": 34914, "wallet_account_id": "single_wallet", "wallet_id": "37958", "window": null}});

const sendMsg = async () => {
    const connection = await amqplib.connect('amqp://guest:guest@127.0.0.1:5672');
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, {durable: true});
    channel.sendToQueue(queueName, Buffer.from(msg));
    console.log('Sent: ', msg);
    setTimeout(() => {
        connection.close();
        // process.exit(0);
    }, 10)
}

let count = 0;
async function start() {
  for await (const _ of Array(20000)) {
    await sendMsg();
    count++;
    console.log(count);
    console.log('sleep 0.1 sec');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

start()



