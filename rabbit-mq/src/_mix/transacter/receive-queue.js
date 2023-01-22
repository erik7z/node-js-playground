const amqplib = require('amqplib');


const consumeTask = async () => {
  const connection = await amqplib.connect('amqp://admin:admin@dc3-phd-rb-001-vs.dev-fuib.com:5672/development');
  const channel = await connection.createChannel();
  await channel.assertQueue("transacter.input", {durable: true});
  channel.prefetch(1);
  console.log(`Waiting for messages in queue: transacter.input`);
  channel.consume("transacter.input", msg => {
    console.log("[X] Received:", msg.content.toString());
  }, {noAck: true})
}

consumeTask();
