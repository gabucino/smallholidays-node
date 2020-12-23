const express = require('express')
const mongoose = require('mongoose')

const routes = require('./routes')
const app = express()
const cors = require('cors');
const passportSetup = require('./passport')
const keys = require('./keys')
const bodyParser = require('body-parser')


app.use(bodyParser.json())


// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

app.use('/api', routes)

app.use(cors({origin: 'http://localhost:3000'}));


app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(status).json({ message: message, data: data })
})

mongoose
  .connect(
    'mongodb+srv://gabus:smallholidayspw@cluster0.nyacx.mongodb.net/smallcalendar',
    {
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then((result) => {
    const server = app.listen(process.env.PORT || 8080) 
  })
  .catch((err) => console.log(err))
