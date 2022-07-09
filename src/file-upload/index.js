const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const fs = require("fs");

const app = express();

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

app.post('/upload', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let avatar = req.files.avatar;

            avatar.mv('./uploads/' + avatar.name);

            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/upload-binary', bodyParser.raw({
    limit: '10mb',
    type: 'image/*'
}), (req, res) => {
    const fileName = req.header('X-File-Name');
    const fd = fs.createWriteStream(`uploads/${fileName}`, {flags: "w+", encoding: "binary"});
    fd.end(req.body);
    fd.on('close', () => res.send({status: 'OK'}))
});

//start app
const port = process.env.PORT || 3000;

app.listen(port, () =>
    console.log(`App is listening on port ${port}.`)
);
