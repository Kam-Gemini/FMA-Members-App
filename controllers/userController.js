import express from "express";

import User from "../models/user.js";

const router = express.Router()

router.route('/views/user/new').get(async function (req, res, next) {
  try {
      res.render('user/new.ejs')
  } catch (e) {
      next (e)
  }
})

router.route('/members/:belt/views/user/new').get(async function (req, res, next) {
    try {
        res.render('user/new.ejs')
    } catch (e) {
        next (e)
    }
})

router.route('/user').post(async function (req, res, next) {
    try {
        // Get the new account from the body of request
        console.log(req.body)
        const user = await User.create(req.body)
        console.log(user)
        res.redirect('/login')

    } catch (e) {
        next(e)
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
      console.log(`user: ${user}`)
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      // 2) Compare the 2 password hashes to see if they're the same.
      // ! This will check if the login is a failure, and respond accordingly.
      if (!user.isPasswordValid(req.body.password)) {
        return res.status(401).send({ message: "Unauthorized"})
      }
  
      // If we succeed, we do this later:
      req.session.user = user
      res.redirect('members')
  
    } catch(e) {
      next(e)
    }
  })

export default router