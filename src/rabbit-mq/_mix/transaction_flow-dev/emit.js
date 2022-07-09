const amqplib = require('amqplib');


const sendMsg = async () => {
    const connection = await amqplib.connect('amqp://dc3-rmq-001-vs.dev-fuib.com:35672/tsys');

    const channel = await connection.createChannel();
    await channel.assertExchange("details_paycheck", 'fanout', {durable: true});

    const msg = JSON.stringify(


        {
            stan: "17637892397",
            transaction_type: "22",
            rrf: "027918",
            cata: "PUMB ONLINE            0442907290     UA",
            sirius_agr_id: "212",
            card_id: "015844443598",
        }


    )
    channel.publish("details_paycheck", "saveTransaction", Buffer.from(msg), {
        headers: {
            contentType: "application/json",
            handler: "saveTransaction"
        }
    });
    console.log('Sent: ', msg);
    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500)
}

sendMsg();
