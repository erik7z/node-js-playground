const { Client } = require('@elastic/elasticsearch')
const faker = require("faker")
var fs = require('fs');

const client = new Client({
    node: 'http://127.0.0.1:9200',
    maxRetries: 5,
    requestTimeout: 60000,
    auth: {
        username: 'elastic',
        password: 'payhub'
    },
    // tls: {
    //     ca: fs.readFileSync('./es01.crt'),
    //     rejectUnauthorized: false
    // }
})

// const blogs = [...Array(10)].map((_, i) => ({
//     blog_id: i,
//     title: faker.lorem.text(),
//     description: faker.lorem.paragraph(),
//     date: faker.date.past()
// }))


const terrorists = JSON.parse(fs.readFileSync('./ter_list.json', 'utf8'));



const run = async () => {
    for await (const terr of terrorists) {
       const item = await client.index({
            index: "sanctions_list",
            body: terr['_source']
        })
        console.log('%o', item);
    }
}


run()
