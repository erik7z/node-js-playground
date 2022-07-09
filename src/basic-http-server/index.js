const http = require('http');
const { Client } = require('pg')

const db = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    database: 'postgres',
    password: 'secretpass'
})

const server = http.createServer(async (req, res) => {
    const route = req.url

    if(route.startsWith('/about')) {
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html')
        res.end('ABOUT PAGE')
    } else {
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html')
        const {rows} = await db.query('SELECT NOW()')

        res.end(`DB time is: ${rows[0].now}`)
    }
})

db.connect().then(() => {
    server.listen(3000, '127.0.0.1', () => console.log(`Server running`))
})



