const express = require('express');

const app = express();

const morgan = require('morgan');

const mongoose = require('mongoose');


// Enable express to parse body data from raw application/json dat

const cors = require('cors');
app.use(cors())
app.options('*', cors())

//environment  variables
require('dotenv/config');


//helpers
const errHandler = require('./helpers/error-handling');
const authJwt = require('./helpers/jwt');

//middleware
app.use(express.json());

//to tell the backend that it will deals with json data from frontend
app.use(morgan('tiny'))
app.use(authJwt())
//errorHandler
app.use(errHandler);
//to make public/uploads static path

app.use('/public/uploads',express.static(__dirname+'/public/uploads'));


// Session Setup




//routes
const productsRouter = require('./routers/products')
const categoriesRouter = require('./routers/categories')
const usersRouter = require('./routers/users')
const ordersRouter = require('./routers/orders')
// const sessionRouter = require('./routers/session')


//routers
app.use(`/api/v1/products`, productsRouter);
app.use(`/api/v1/categories`, categoriesRouter);
app.use(`/api/v1/users`, usersRouter);
app.use(`/api/v1/orders`, ordersRouter);


//Database
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database Connection is ready.");
app.listen(3000, ()=>{
  console.log('server is runnin now on 3000')
})

  })
  .catch((err) => {
    console.log(err);
  });













