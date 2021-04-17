const express = require('express');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vh4xj.mongodb.net/theEvent?retryWrites=true&w=majority`;

require('dotenv').config();
console.log(process.env.DB_USER,process.env.DB_PASS);

// app.use(bodyParser.json({limit: "50mb"}));
// app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
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

        console.log('connect');
       
});



app.listen(port)