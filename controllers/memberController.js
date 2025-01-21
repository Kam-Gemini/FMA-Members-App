// * This file is where all our logic lives for destinations.
// * All the endpoints/routes live in here.

// TODO use a router to refactor our routes in here.

import express from "express";

import Member from "../models/members.js";

const router = express.Router()

router.route('/').get(async function (req, res, next) {
    try {
        res.render('home.ejs')
    } catch (e) {
        next (e)
    }
})

router.route('/members').post(async function (req, res, next) {
    try {

        if (!req.session.user) {
        return res.status(402).send({ message: "You must be logged in to post a profile." })
        }

        // ! Add the user to the req.body, from the cookie
        req.body.user = req.session.user
        // Get the new member from the body of request
        const newMember = await Member.create(req.body)
        // res.status(400).send(newMember)
        res.redirect('/members')

    } catch (e) {
        next(e)
    }
})


router.route('/members').get(async function (req, res, next) {
    try {
        const user = req.session.user
        const allMembers = await Member.find()
        res.render('members/index.ejs', {
            allMembers: allMembers,
            isLoggedIn: !!user // Pass a flag for whether the user is logged in
        })
    } catch (e) {
        next(e)
    }
})

// GET /member/new
router.route('/members/new').get(async function (req, res) {
    try {
        res.render('members/new.ejs')
    } catch (e) {
        next(e)
    }
});

router.route('/members/:id').get(async function (req, res, next) {
    try {
        const memberId = req.params.id
        const member = await Member.findById(memberId).exec()
        res.render('members/show.ejs', {
            member: member
          })
    } catch (e) {
        next(e)
    }
})

router.route('/members/belt/:belt').get(async function (req, res, next) {
    try {
        const memberBelt = req.params.belt
        const allMembers = await Member.find({belt: memberBelt}).exec()
        res.render('members/index.ejs', {
            allMembers: allMembers
        })
    } catch (e) {
        next(e)
    }
})


router.route('/members/:id').delete(async function (req, res, next) {
    try {
        const memberId = req.params.id

        const member = await Member.findById(memberId).populate('user')

        if (!req.session.user) {
            res.redirect("/login")
        }

        // * Compare the user who is current logged in (req.session.user)
        // * with the user ON the destination (destination.user)
        console.log(req.session.user._id)
        console.log(member.user._id)
        
        if (!member.user._id.equals(req.session.user._id)) {
            return res.status(402).send({ message: "This is not your profile to delete!"})
        }

        if (!member) {
            return res.send({ message: "Profile doesn't exist." })
        }

        await Member.findByIdAndDelete(memberId)

        res.redirect('/members')
    } catch (e) {
        next(e)
    }  
})

router.route('/members/update/:id').get(async function(req, res, next) {
    try {
        const member = await Member.findById(req.params.id).exec()
        console.log(member.weight)
        res.render('members/update.ejs', {
            member: member
        })
      
    } catch(e) {
      next(e)
    }
  })

router.route('/members/:id').put(async function (req, res, next) {
    try {
        const userRole = req.session.user.role
        console.log(userRole)
        if (!req.session.user) {
            return res.status(402).send({ message: "You must be logged in to update a profile." })
        }
        if (userRole !== "Admin") {
            return res.status(402).send({ message: "You must be an Admin User to update a profile." })    
        }
        const memberId = req.params.id
        const updatedMember = await Member.findByIdAndUpdate(memberId, req.body, { new: true })
        res.redirect('/members')
    } catch (e) {
        next(e)
    }
})

export default router