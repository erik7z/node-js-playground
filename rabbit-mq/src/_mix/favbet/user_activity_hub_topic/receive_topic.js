const amqplib = require('amqplib');


const exchangeName = "user_activity_hub.v2.out";
const topics = ['account_status_changed']
const queueName = 'node-affiliate-queue-nguita'

const recieveMsg = async () => {
  const connection = await amqplib.connect('amqp://master:ffKi37ZdEXIumu3V@de2rmq01d.dev.favorit:5672/master');
  const channel = await connection.createChannel();
  await channel.assertExchange(exchangeName, 'topic', {durable: true});
  const q = await channel.assertQueue(queueName, {exclusive: false});

  console.log(`Waiting for messages in queue: ${q.queue}`);

  topics.forEach(function(key) {
    channel.bindQueue(q.queue, exchangeName, key);
  });

  channel.consume(q.queue, msg => {
    if(msg.content) console.log(`Routing Key: ${msg.fields.routingKey}, Message: ${msg.content.toString()}`);
  }, {noAck: true})
}

recieveMsg();
