const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIP_SECRET);
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mieka.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// mongodb+srv://<username>:<password>@cluster0.mieka.mongodb.net/?retryWrites=true&w=majority

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('wall-paint');
    const serviceCollection = database.collection('services');
    const bookingCollection = database.collection('allBooking');
    const userCollection = database.collection('users');
    const reviewCollection = database.collection('reviews');
    console.log('db connected');
    //

    app.post('/services', async (req, res) => {
      const serviceData = req.body;
      const result = await serviceCollection.insertOne(serviceData);
      console.log(result);
      res.json(result);
    });
    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find({}).limit(6);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get('/allService', async (req, res) => {
      const cursor = serviceCollection.find({});
      const cars = await cursor.toArray();
      res.send(cars);
    });

    //delete car from manage services page
    app.delete('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      console.log('deleting user with id', result);
      res.json(result);
    });

    // orders
    app.post('/booking', async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      console.log(result);
      res.json(result);
    });
    // get orders
    app.get('/booking', async (req, res) => {
      const cursor = bookingCollection.find({});
      const cars = await cursor.toArray();
      res.send(cars);
    });
    // get my order for orders
    app.get('/myBooking/:email', async (req, res) => {
      console.log(req.params.email);
      const result = await bookingCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });
    app.get('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingCollection.findOne(query);
      res.send(booking);
    });
    //delete from all orders/booking api
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      console.log('deleting user with id', result);
      res.json(result);
    });

    //stripe payment
    app.post('/create-payment-intern', async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await paymentIntents.create({
        currency: 'usd',
        amount: amount,
        payment_method_types: ['card'],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // post users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log(user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // reviews
    app.post('/reviews', async (req, res) => {
      const reviewData = req.body;
      const result = await reviewCollection.insertOne(reviewData);
      console.log(result);
      res.json(result);
    });
    //get all reviews
    app.get('/reviews', async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });

    //update the status
    app.put('/statusUpdate/:id', async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const result = await bookingCollection.updateOne(filter, {
        $set: {
          status: req.body.status,
        },
      });
      res.send(result);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello wall paint');
});

app.listen(port, () => {
  console.log(` listening at ${port}`);
});
