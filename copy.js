const express = require('express')
const app = express()
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5050;
app.use(express.json());
app.use(cors());
require('dotenv').config(); 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cvfa5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("review");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");

  app.post('/addService', (req, res) => {
      const serviceInfo = req.body;
      serviceCollection.insertOne(serviceInfo)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
  })

  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  })

  app.post('/addOrder', (req, res) => {
    const order = req.body
    orderCollection.insertOne(order)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/addAdmin', (req, res) => {
    const order = req.body
    adminCollection.insertOne(order)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/services', (req, res) => {
    serviceCollection.find()
    .toArray((err, items) => {
      res.send(items)
    })
  })

  app.get('/reviews', (req, res) => {
    reviewCollection.find()
    .toArray((err, items) => {
      res.send(items)
    })
  })

  app.get('/orders', (req, res) => {
    orderCollection.find()
    .toArray((err, items) => {
      res.send(items)
    })
  })

  app.get('/services/:id', (req, res) => {
    serviceCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, items) => {
      res.send(items[0])
    })
  })

  app.patch('/statusUpdate/:id', (req, res) => {
    orderCollection.updateOne({_id: ObjectId(req.params.id)},{
      $set: {status: req.body.status}
    })
    .then(result => {
      res.send( result.modifiedCount > 0)
    })
  })

  app.delete('/delete/:id', (req, res) => {
    serviceCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
      res.send( result.deletedCount > 0)
    })

  })

});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)