const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 7000;
const session = require('express-session');


// --------MiddleWire------------
app.use(cors());
app.use(express.json());
app.use(session({
  secret: '9275389sjyteckh3452097shxnlime1948',
  resave: false,
  saveUninitialized: true
}));

const uri = "mongodb+srv://aurthohinparvez2:Lp31ngSaPwngIi2g@cluster0.oap4niv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// Async Function 
async function run() {

    try{
        await client.connect();
        const productCollection = client.db("ecomerce").collection("product");
        const userCollection = client.db("user").collection("allUser")
        const orderCollection = client.db("order").collection("allOrder");
        const roleCollection = client.db('role').collection('allRole')

        app.get("/product", async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
          });
          app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const result = await productCollection.findOne({ _id:new ObjectId(id) });
            res.send(result);
          });
// Database connected 
          app.post('/product', async (req, res) => {
            const { name, description } = req.body;
            try {
              // Save product to the database with pending status
              const result = await productCollection.insertOne({
                name,
                description,
                status: 'pending',
              });
              res.status(201).json({ productId: result.insertedId });
            } catch (error) {
              console.error('Error saving product:', error);
              res.status(500).json({ message: 'Error submitting product.' });
            }
          });
          app.put('/product/:productId', async (req, res) => {
            const { productId } = req.params;
            const { category } = req.body;
          
            try {
              // Update product category
              const result = await productCollection.updateOne(
                { _id:new ObjectId(productId) },
                { $set: { category } }
              );
          
              if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Product not found.' });
              }
          
              res.json({ message: 'Product category updated.' });
            } catch (error) {
              console.error('Error updating product category:', error);
              res.status(500).json({ message: 'Error updating product category.' });
            }
          });
          // API endpoint to handle admin approval
          app.put('/product/:productId/approve', async (req, res) => {
            const { productId } = req.params;
        
            try {
              // Update product status to approved
              const result = await productCollection.updateOne(
                { _id:new ObjectId(productId) },
                { $set: { status: 'approved' } }
              );
        
              if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Product not found.' });
              }
        
              res.json({ message: 'Product approved.' });
            } catch (error) {
              console.error('Error approving product:', error);
              res.status(500).json({ message: 'Error approving product.' });
            }
          });
        
          // API endpoint to handle admin rejection
          app.put('/product/:productId/reject', async (req, res) => {
            const { productId } = req.params;
        
            try {
              // Update product status to rejected
              const result = await productCollection.updateOne(
                { _id:new ObjectId(productId) },
                { $set: { status: 'rejected' } }
              );
        
              if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Product not found.' });
              }
        
              res.json({ message: 'Product rejected.' });
            } catch (error) {
              console.error('Error rejecting product:', error);
              res.status(500).json({ message: 'Error rejecting product.' });
            }
          });
          // ---------------------- User --------------------------------
          
      
          app.put("/admin/approve/:userId", async (req, res) => {
            const userId = req.params.userId;
            const { role } = req.body;
            try {
                const updatedUser = await userCollection.findOneAndUpdate(
                    { _id: new ObjectId(userId) },
                    { $set: { role, status: "success" } },
                    { returnDocument: "after" }
                );
                res.send(updatedUser);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });
        
        // Endpoint to create a new user
        app.post("/user", async (req, res) => {
            const newUser = req.body;
            newUser.status = "pending"; // Set initial status as pending
            try {
                const result = await userCollection.insertOne(newUser);
                res.send(result.ops[0]);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });
        
        // Endpoint to fetch all users
        app.get("/user", async (req, res) => {
            try {
                const users = await userCollection.find().toArray();
                res.send(users);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

          // -------------------------Order-------------------------
          app.post("/order", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)
          })
      
          app.get("/order", async (req, res) => {
            const users = await orderCollection.find().toArray();
            res.send(users);
          });
          app.get("/order/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id:new ObjectId(id) }
            const orders = await orderCollection.findOne(query);
            res.send(orders)
          })
          app.get("/order/user/:email", async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const users = await orderCollection.find(query).toArray();
            res.send(users);
          });

          app.get("/category", async (req, res) => {
            const categoryName = req.query.name;
            const query = { category: categoryName };
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

          // -------------------------admin--------------------------


          // ------------------------ Role -------------------------------

          app.post("/role", async (req, res) => {
            const order = req.body;
            const result = await roleCollection.insertOne({
                ...order,
                status: "pending"
            });
            
            res.send(result);
        });
        app.get("/role/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id:new ObjectId(id) }
          const orders = await roleCollection.findOne(query);
          res.send(orders)
        })

        app.get("/role", async (req, res) => {
          const users = await roleCollection.find().toArray();
          res.send(users);
        });
        
        app.put("/role/:id/approve", async (req, res) => {
          const roleId = req.params.id;
          const result = await roleCollection.updateOne(
              { _id: new ObjectId(roleId) }, 
              { $set: { status: "success" } }
          );
          if (result.modifiedCount > 0) {
              const pendingRoles = await roleCollection.find({ userId: result.userId, status: "pending" }).toArray();
              if (pendingRoles.length > 0) {
                  await roleCollection.updateMany(
                      { userId: result.userId, status: "pending" },
                      { $set: { status: "approved" } }
                  );
              }
          }
      
          res.send(result);
      });
      
        
        app.put("/role/:id/reject", async (req, res) => {
            const roleId = req.params.id;
            const result = await roleCollection.updateOne(
                { _id:new ObjectId(roleId) }, 
                { $set: { status: "reject" } }
            );
            
            res.send(result);
        });

// get email

        app.get("/role/user/:email", async (req, res) => {
          const email = req.params.email
          const query = { email: email }
          const users = await roleCollection.find(query).toArray();
          res.send(users);
        });
        
    }
    
    finally { }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Alhamdulliah Your server is Running");
});
app.listen(port, () => {
  console.log("Alhamdullilah Your server is Start");
});