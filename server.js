// Local Import
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan'); //logger
const colors = require('colors') //optional
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorhandler = require('./middleware/error') //error Handler
const ConnectDB = require('./config/db') //database 

//  Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//  load env files
dotenv.config({
    path: './config/config.env'
});

//connect to DB
ConnectDB();

// Initialize Express APP variable
const app = express();

// Body Parser
app.use(express.json());

//  Cookie Parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File Uploading
app.use(fileupload());

//  Sanitize Data Middleware
app.use(mongoSanitize());

//  Set Security Headers Using Helmet
app.use(helmet());

//  Prevent Cross Site Scripting
app.use(xss());

//  Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 Mins
    max: 100 // Maximum Request
})

app.use(limiter)

//  Prevent Http Parameter Pollutiion
app.use(hpp());

//  Enable Cors
app.use(cors());

//  set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount Route 
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// Use Error handler
app.use(errorhandler);

// Initialize PORT Variable
const PORT = process.env.PORT || 5000;

// Listen to APP Connection
const server = app.listen(
    PORT,
    console.log(`SERVER Running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error : ${err.message
    }`.red)
    //close server & exit process
    server.close(() => process.exit(1));
})