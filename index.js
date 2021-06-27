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

const handlePost = (route, collection) => {
  app.post(route, (req, res) => {
    const data = req.body;
    collection.insertOne(data)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  })
}
handlePost('/addService', serviceCollection)
handlePost('/addReview', reviewCollection)
handlePost('/addOrder', orderCollection)
handlePost('/addAdmin', adminCollection)

const handleGet = (route, collection, findObj = {}) => {
  app.get(route, (req, res) => {
    collection.find(
      findObj === 'email' ? {email: req.query.email}:
      findObj === 'id'? {_id: ObjectId(req.params.id)}: null
    )
    .toArray((err, items) => {
      res.send(items)
    })
  })
}
handleGet('/services', serviceCollection);
handleGet('/reviews', reviewCollection);
handleGet('/orders', orderCollection);
// handleGet('/services/:id', serviceCollection, 'id')
handleGet('/bookingList', orderCollection, 'email');
// handleGet('/admin', adminCollection, 'email')
handleGet('/userReview', reviewCollection, 'email');
handleGet('/userReview/:id', reviewCollection, 'id');


app.get('/services/:id', (req, res) => {
  serviceCollection.find({_id: ObjectId(req.params.id)})
  .toArray((err, items) => {
    res.send(items[0])
  })
})

// app.get('/bookingList', (req, res) => {
//   orderCollection.find({email: req.query.email})
//   .toArray((err,items) => {
//     res.send(items)
//   })
// })

// app.get('/userReview', (req, res) => {
//   console.log(req.query.email);
//   reviewCollection.find({email: req.query.email})
//   .toArray((err,items) => {
//     res.send(items)
//   })
// })

app.get('/admin', (req, res) => {
  adminCollection.find({email: req.query.email})
  .toArray((err,items) => {
    res.send(items.length > 0)
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

// const handleUpdate = (route, collection, options) => {
//   app.patch(route, (req, res) => {
//     collection.updateOne({_id: ObjectId(req.params.id)},{
//         $set: req.body
//     })
//     .then(result => {
//       res.send( result.modifiedCount > 0)
//     })
//   })
// }
// handleUpdate('/statusUpdate/:id', orderCollection, 'status');
// handleUpdate('/updateReview/:id', reviewCollection);

app.patch('/updateReview/:id', (req, res) => {
  console.log(req.body);
  reviewCollection.updateOne({_id: ObjectId(req.params.id)},{
      $set: req.body
  })
  .then(result => {
    res.send( result.modifiedCount > 0)
  })
})

  const handleDelete = (route, collection) => {
    app.delete(route, (req, res) => {
      collection.deleteOne({_id: ObjectId(req.params.id)})
      .then(result => {
        res.send( result.deletedCount > 0)
      })
    })
  }
  handleDelete('/delete/:id', serviceCollection);
  handleDelete('/deleteReview/:id', reviewCollection);
  handleDelete('/deleteOrder/:id', orderCollection);
  
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)