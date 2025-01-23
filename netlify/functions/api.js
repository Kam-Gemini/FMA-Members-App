import express from 'express'

import mongoose from 'mongoose'

import methodOverride from 'method-override'

import session from 'express-session'

// 🚨 If you're not already using MongoStore, please `npm i connect-mongo`
import MongoStore from 'connect-mongo'

// 🚨 New dependency, `npm i serverless-http` and use it here:
import serverless from 'serverless-http'

import memberController from '../../controllers/memberController.js'

import userController from '../../controllers/userController.js'

import logger from '../../middleware/logger.js'

import errorHandler from '../../middleware/errorHandler.js'

import flash from 'connect-flash'

// import dotenv to extract environment variables from the .env file
import dotenv from 'dotenv'
dotenv.config() // initalises .env

// 🚨 Grab the Mongo URL variable from your .env file:
mongoose.connect(process.env.MONGODB_URI)

const app = express()

// Set EJS as the template engine
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public")); // ! You need this line for stylesheets/JS

// * Add sessions to express
app.use(session({
    secret: 'timeonthemats', // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
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

// 🚨 Remove entire app.listen piece at the bottom, and do this instead:
export const handler = serverless(app)
