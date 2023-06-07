const amqplib = require('amqplib');

const exchangeName = "topic_logs";
const msg = "Test message"
const routingKey = "account_status_changed2"

const sendMsg = async () => {
  const connection = await amqplib.connect('amqp://guest:guest@127.0.0.1:5673');
  const channel = await connection.createChannel();
  await channel.assertExchange(exchangeName, 'topic', {durable: false});

  channel.publish(exchangeName, routingKey, Buffer.from(msg));

  console.log('Sent: ', msg);
  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500)
}

sendMsg();
