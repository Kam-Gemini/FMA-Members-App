// * This file is where all our logic lives for destinations.
// * All the endpoints/routes live in here.

// TODO use a router to refactor our routes in here.

import express from "express";

import Member from "../models/members.js";

import multer from "multer"

const router = express.Router()

// Configure Multer for in-memory storage with a 1MB limit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
});

router.route('/').get(async function (req, res, next) {
    try {
        res.render('home.ejs')
    } catch (e) {
        next (e)
    }
})

router.post('/members', upload.single("image"), async function (req, res, next) {
    try {

        if (!req.session.user) {
            req.flash("error",  "You must be logged in to post a profile")
            return res.redirect(`/login`)
        }

        // ! Add the user to the req.body, from the cookie
        req.body.user = req.session.user

        // Check if an image was uploaded
        if (req.file) {
            req.body.headshot = req.file.buffer.toString("base64");
        } else {
            req.body.headshot = ""; // Set headshot to an empty string or a default value if no image is uploaded
        }
        // Get the new member from the body of request
        const newMember = await Member.create(req.body)

        res.redirect('/members')

    } catch (e) {
        // If any error occurs, particularly validation errors, handle them
        if (e.name === 'ValidationError') {
            // Iterate through the validation errors and store them in req.flash
            for (const field in e.errors) {
                req.flash('error', e.errors[field].message);
            }
            console.log(req.body)
            // Re-render the form with the current input data and error messages
            return res.render('members/new', {
                errorMessages: req.flash('error'),
                member: req.body
            });
        } else {
            // Pass the error to the next middleware
            next(e);
        }
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
        res.render('members/new', { errorMessages: [], member: {} });
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

        if (!member) {
            return res.send({ message: "Profile doesn't exist." })
        }

        if (!member.user._id.equals(req.session.user._id)) {
            req.flash("error",  "This is not your profile to delete")
            return res.redirect(`/members/${member._id}`)
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
        res.render('members/update.ejs', {
            member: member
        })
      
    } catch(e) {
      next(e)
    }
  })

  router.route('/members/:id').put(async function (req, res, next) {
    try {
        // Check if the user is logged in
        if (!req.session.user) {
            req.flash("error", "You must be logged in to update a profile.");
            return res.redirect('/login'); // Redirect to login instead of using `member._id`
        }

        const userRole = req.session.user.role;
        const userEmail = req.session.user.email;

        // Fetch the member to perform further checks
        const member = await Member.findById(req.params.id);
        if (!member) {
            req.flash("error", "Member not found.");
            return res.redirect('/members');
        }

        // Check if the user is authorized to update the profile
        if (userRole !== "Admin" && member.email !== userEmail) {
            req.flash("error", "You must be an Admin User or the owner of the profile to update it.");
            return res.redirect(`/members/update/${member._id}`);
        }

        // Update the member while ensuring validations are run
        const memberId = req.params.id;
        const updatedMember = await Member.findByIdAndUpdate(memberId, req.body, {
            new: true,
            runValidators: true, // Ensures Mongoose validation rules are applied
        });

        res.redirect('/members');
    } catch (e) {
        // Handle Mongoose validation errors
        if (e.name === 'ValidationError') {
            for (const field in e.errors) {
                req.flash('error', e.errors[field].message);
            }
            return res.redirect(`/members/update/${req.params.id}`);
        } else {
            next(e);
        }
    }
});


export default router