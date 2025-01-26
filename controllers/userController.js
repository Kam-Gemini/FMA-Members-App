import express from "express";

import User from "../models/user.js";

const router = express.Router()

router.route('/views/user/new').get(async function (req, res, next) {
  try {
    res.render('user/new.ejs');
    } catch (e) {
      next(e)
  }
})

router.route('/members/views/user/new').get(async function (req, res, next) {
  try {
      res.render('user/new.ejs')
    } catch (e) {
      next(e)
  }
})

router.route('/members/belt/views/user/new').get(async function (req, res, next) {
  try {
      res.render('user/new.ejs')
    } catch (e) {
      next(e)
  }
})

router.route('/members/:belt/views/user/new').get(async function (req, res, next) {
    try {
        res.render('user/new.ejs')
      } catch (e) {
        next(e)
    }
})

router.route('/user').post(async function (req, res, next) {
    try {
        const enteredEmail = req.body.email.trim().toLowerCase()
        const enteredUsername = req.body.username
        const existingEmail = await User.findOne({email: enteredEmail})
        const existingUsername = await User.findOne({username: enteredUsername})

        if (existingEmail) {
          req.flash("error",  "The email you have entered is already registered with another account.")
          return res.redirect('/views/user/new');
        }

        if (existingUsername) {
          req.flash("error",  "The user name you have entered is already registered with another account.")
          return res.redirect('/views/user/new');
        }

        await User.create(req.body)
        res.redirect('/login')

      } catch(e) {
        // If any other error occurs, send the error to the next middleware
        if (e.name === 'ValidationError') {
          // Handle Mongoose validation errors
          for (const field in e.errors) {
              req.flash('error', e.errors[field].message);
          }
          return res.redirect('/views/user/new');
        } 
      }
})

// TODO login
// Login page (just like user.ejs) ✅
// GET /login controller to return our ejs page ✅
// When you sign up, redirect to login ✅
router.get('/login', (req, res, next) => {
    try {
      res.render("user/login.ejs");
    } catch (e) {
      next(e)
    }  
  })
  
  // POST /login controller to handle POSTing the login.
  router.post('/login', async (req, res, next) => {
    try {
      // ? We need to know if the login was actually successful!
      // 1) Get the user for this login attempt (with email)
      const user = await User.findOne({ email: req.body.email })
      if (!user) {
        req.flash("error",  "There is no user account for the email entered.")
        return res.redirect('/login');
      }
      // 2) Compare the 2 password hashes to see if they're the same.
      // ! This will check if the login is a failure, and respond accordingly.
      if (!user.isPasswordValid(req.body.password)) {
        req.flash("error",  "The password is incorrect, please try again.")
        return res.redirect('/login');
      }
  
      // If we succeed, we do this later:
      req.session.user = user
      res.redirect('/members')
  
    } catch(e) {
      // If any other error occurs, send the error to the next middleware
      if (e.name === 'ValidationError') {
        // Handle Mongoose validation errors
        for (const field in e.errors) {
            req.flash('error', e.errors[field].message);
        }
        return res.redirect('/login');
        } else {
            next(e);
        }
    }
  })

  router.post('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('members')
  })

export default router