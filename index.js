const express = require('express');
const app = express();

const morgan = require('morgan');

const mongoose = require('mongoose');

const session = require('express-session');

const parseurl = require('parseurl');





// Enable express to parse body data from raw application/json dat

const cors = require('cors');
app.use(cors())
app.options('*', cors())

//environment  variables
require('dotenv/config');
const api = process.env.API_URL;

//helpers
const errHandler = require('./helpers/error-handling');
const authJwt = require('./helpers/jwt');

//middleware
app.use(express.json())
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
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);







app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {}
  }

  // get the url pathname
  var pathname = parseurl(req).pathname

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1

  next();
})

app.get('/api/v1/session', function (req, res, next) {
  console.log(req.session.views)
  res.status(200).json({success: true , message:  req.session.views['/api/v1/session'] });
})






//Database
mongoose
  .connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database Connection is ready.");
  })
  .catch((err) => {
    console.log(err);
  });














app.listen(3000, ()=>{

    console.log(api)
    console.log('server is runnin now on 3000')
})