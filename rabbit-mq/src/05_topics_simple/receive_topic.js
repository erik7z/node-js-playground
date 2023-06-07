const amqplib = require('amqplib');


const exchangeName = "topic_logs";
const topics = ['account_status_changed']

const recieveMsg = async () => {
  const connection = await amqplib.connect('amqp://guest:guest@127.0.0.1:5673');
  const channel = await connection.createChannel();
  await channel.assertExchange(exchangeName, 'topic', {durable: false});
  const q = await channel.assertQueue('', {exclusive: true});

  console.log(`Waiting for messages in queue: ${q.queue}`);

  topics.forEach(function(key) {
    channel.bindQueue(q.queue, exchangeName, key);
  });

  channel.consume(q.queue, msg => {
    if(msg.content) console.log(`Routing Key: ${msg.fields.routingKey}, Message: ${msg.content.toString()}`);
  }, {noAck: true})
}

recieveMsg();
