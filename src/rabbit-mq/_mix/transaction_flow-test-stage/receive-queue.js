const amqplib = require('amqplib');


const consumeTask = async () => {
    const connection = await amqplib.connect('amqp://guest:guest@localhost:45672/tsys');
  // const connection = await amqplib.connect('amqp://guest:guest@dc3-rmq-001-vs.stage-fuib.com:35672/tsys');

    const channel = await connection.createChannel();
  await channel.assertQueue("details_paycheck:saveTransaction", {durable: true});
  channel.prefetch(1);
  console.log(`Waiting for messages in queue: details-paycheck`);
  channel.consume("details_paycheck:saveTransaction", msg => {
    console.log("[X] Received:", msg.content.toString());
  }, {noAck: false})
}

consumeTask();
