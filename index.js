const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
// const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lmoae.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(cors())
app.use(bodyParser.json()); 
app.use(fileUpload());


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const apartmentCollection = client.db("apartmentHunt").collection("apartments");
    const bookingCollection = client.db("apartmentHunt").collection("books");

    app.post('/addApartment', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const location = req.body.location;
        const price = req.body.price;
        const bathroom = req.body.bathroom;
        const bedroom = req.body.bedroom;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const picture = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        apartmentCollection.insertOne({title, location, price, bathroom, bedroom, picture})
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.post('/addBooking', (req, res) => {
        const bookingInfo = req.body;

        bookingCollection.insertOne(bookingInfo)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/bookings', (req, res) => {
        bookingCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.post('/userRent', (req, res) => {
        const email = req.body.email;
        bookingCollection.find({email: email})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.get('/apartments', (req, res) => {
        apartmentCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

});


app.listen(process.env.PORT || 4000)