const express = require('express')
const app = express()
require('dotenv').config()
var cors = require('cors')
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors({
    origin:"*",
    methods:"GET,PUT,PATCH,POST,DELETE"
    
}))


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mtdunhe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db("gadget-arena");
    const productCollection = database.collection("products");
    app.get('/products', async(req, res) => {
        const category= req.query.category;
        const brandName= req.query.brandName;
        const sorting= req.query.sort;
        const priceLowerLimit= parseInt(req.query.priceLowerLimit) 
        const priceUpperLimit=parseInt(req.query.priceUpperLimit) 
        console.log({brandName,category,priceLowerLimit,priceUpperLimit})
        let query={}
        if(category==='null'){
            query={}
        }
        else if(brandName==='null' && category !== 'null'){
            query= {category: category, price:{$gte: priceLowerLimit, $lte: priceUpperLimit }}
        }else{
            query = {brandName: brandName, category:category, price:{$gte: priceLowerLimit, $lte: priceUpperLimit }}
        }
        let options={}
        if(sorting!=='null'){
            if(sorting==='priceAscending'){
                options={
                    sort: {price : 1}
                }
            }
            else if(sorting==='priceDescending'){
                options={
                    sort: {price: -1}
                }
            }
            else if(sorting==='latest'){
                options={
                    sort: { productCreationDateTime: -1 }
                }
            }
        }
        const page = parseInt(req.query.page) || 1;  
        const limit = parseInt(req.query.limit) || 6
        const skip = (page - 1) * limit;
        const products =await productCollection.find(query,options).skip(skip).limit(limit).toArray();
        const total = await productCollection.countDocuments(query,options);
        console.log(products)
        res.json({
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        });
        // res.send(result)
        // console.log({category,brandName})
        // console.log(result)
      })
    app.get('/getallproducts',async(req,res)=>{
        const result = await productCollection.find().toArray();
        res.send(result)
        console.log(result)
    })  
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})