import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator"

// create a schema (consistent format) for my destination collection
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'You must enter a user name.'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please enter your email.'], // Ensures email is mandatory
        unique: true, // Ensures email is unique in the database
        lowercase: true, // Converts email to lowercase before saving
        trim: true, // Removes whitespace
        validate: {
            validator: (email) => validator.isEmail(email),
            message: "Please enter a valid email."
        }
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        validate: {
            validator: (password) => validator.isStrongPassword(password, {
                minLength: 8, minUppercase: 1, minSymbols: 1, minNumbers: 1
            }),
            message: "Password must be at least 8 characters and contain at least 1 uppercase letter, 1 number, and 1 symbol."
        }
    },    
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'End User']
    }
})

userSchema.set("toJSON", {
    virtuals:true,
    transform(_doc, json){
        delete json.password
        return json
    }
})
// Virtual field for confirmPassword
userSchema
    .virtual('confirmPassword')
    .set(function (confirmPassword) {
        return this._confirmPassword = confirmPassword
    })

userSchema
    .pre("validate", function(next) {
        if (this.isModified("password") && this.password !== this._confirmPassword){
            this.invalidate("confirmPassword", "Passwords do not match. Please re-type.")
        }
        next()
    })

// * Before the user document is created, we want to replace 
// * the password with a hashed version.
// mongoose has a lifecycle for each document, e.g. validation, saving etc.
// this one runs before saving a document to the database.
userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
      this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync())
    }
    next()
})

// * I need a function to compare the passwords and return true
// * if the passwords match.
// This will actually a method to all user documents.
userSchema.methods.isPasswordValid = function (plaintextPassword) {
    // Use bcrypt to check the 2 passwords
    // ? Argument 1: password user is trying to log in with
    // ? Argument 2: real existing hashed password for this user
    return bcrypt.compareSync(plaintextPassword, this.password)
}

// export the schema as a model
// ! The first argument to the model method MUST be a string pascalcase (uppercase words), singular 

export default mongoose.model("User", userSchema)