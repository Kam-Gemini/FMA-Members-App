import express from 'express'

import mongoose from 'mongoose'

import memberController from './controllers/memberController.js'

import userController from './controllers/userController.js'

import logger from './middleware/logger.js'

import errorHandler from './middleware/errorHandler.js'

import methodOverride from 'method-override'

import session from 'express-session'

import flash from 'connect-flash'

import MongoStore from 'connect-mongo'

import path from "path"; // ! You need this line for stylesheets/JS

import { fileURLToPath } from "url" // ! You need this line for stylesheets/JS

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url) // ! You need this line for stylesheets/JS

const __dirname = path.dirname(__filename) // ! You need this line for stylesheets/JS

// import dotenv to extract environment variables from the .env file
import dotenv from 'dotenv'
dotenv.config() // initalises .env

const app = express()

// Set EJS as the template engine
app.set("view engine", "ejs");

// Serve static files
app.use(express.static(path.join(__dirname, "public"))); // ! You need this line for stylesheets/JS

// Serve Flaticon icons as a static resource
app.use("/flaticon", express.static(path.join(__dirname, "node_modules/@flaticon/flaticon-uicons")));

// * Add sessions to express
app.use(session({
    secret: 'timeonthemats', // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/members-db', // replace with your db name
        collectionName: 'sessions', // Optional: specify the collection name
    }),
    cookie: {
        secure: false, // Use true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
}));

app.use(flash())

// Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

app.use(express.json())

// * This will expect the form data from your form, and add to req.body 
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.use(function (req, res, next) {
    res.locals.user = req.session.user || null
    next()
})

// * New logging middleware
app.use(logger)

// * Have our app use the new member controller
app.use('/', memberController)

app.use('/', userController)

// * Final piece of middleware
app.use(errorHandler)

// Listen for requests on port 3000
app.listen(3000, () => {
    console.log('Listening on port 3000')
  })

// * Connect to our database using mongoose.
const url = 'mongodb://127.0.0.1:27017/'
const dbname = 'members-db'
mongoose.connect(`${url}${dbname}`)