const express = require('express');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vh4xj.mongodb.net/theEvent?retryWrites=true&w=majority`;

require('dotenv').config();
console.log(process.env.DB_USER,process.env.DB_PASS);

const app = express()

app.use(express.static('services'));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(cors());

const port = 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})
  


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ServicesCollection = client.db("theEvent").collection("services");
  const ordersCollection = client.db("theEvent").collection("orderPlace");
  const AdminCollection = client.db("theEvent").collection("allAdmin");
  const  reviewCollection = client.db("theEvent").collection("allReview");
  app.post('/addServices',(req,res)=>{
    const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        ServicesCollection.insertOne({ title,description, image,price })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})

app.get('/allService', (req, res) => {
    ServicesCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});

app.get('/Allbook/:id',(req, res) =>{
    ServicesCollection.find({_id:ObjectId(req.params.id)})
   .toArray((err,documents)=>{
       
      res.send(documents[0])
   })
 })

 app.post("/addOrder",(req, res) =>{
    const order = req.body;
    ordersCollection.insertOne(order)
    .then(result=>{
        res.send(result.insertedCount > 0)
    })
})

app.get('/bookingList', (req, res) => {
    ordersCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});

app.delete('/deleteService/:id',(req, res) =>{
    ServicesCollection.deleteOne({_id:ObjectId(req.params.id)})
   .then(result=>{
     res.send(result.deletedCount > 0)
   })
 })

 app.post("/makeAdmin",(req, res) =>{
    const email = req.body;
    AdminCollection.insertOne(email)
    .then(result=>{
        res.send(result.insertedCount > 0)
    })
})
 app.post("/review",(req, res) =>{
    const review = req.body;
    reviewCollection.insertOne(review)
    .then(result=>{
        res.send(result.insertedCount > 0)
    })
})

app.get('/isAdmin', (req, res) => {
    const email = req.body.email;
    AdminCollection.find({email: email })
        .toArray((err, admin) => {
            res.send(admin.length > 0);
            console.log(err);
        })
})

        console.log('connect');
       
});



app.listen( process.env.PORT|| port)