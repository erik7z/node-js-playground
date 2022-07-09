const amqplib = require('amqplib');

const recieveMsg = async () => {
  const connection = await amqplib.connect('amqp://dc3-rmq-001-vs.dev-fuib.com:35672/tsys');
  const channel = await connection.createChannel();
  await channel.assertExchange("details_paycheck", 'fanout', {durable: true});
  const q = await channel.assertQueue('details_paycheck', {exclusive: false});
  console.log(`Waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, "details_paycheck", "saveTransaction");

  channel.consume(q.queue, msg => {
    if(msg.content) console.log(`Routing Key: ${msg.fields.routingKey}, Message: ${msg.content.toString()}`);
  }, {noAck: false})
}

recieveMsg();
