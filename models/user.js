import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator"

// create a schema (consistent format) for my destination collection
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'], // Ensures email is mandatory
        unique: true, // Ensures email is unique in the database
        lowercase: true, // Converts email to lowercase before saving
        trim: true, // Removes whitespace
        validate: {
            message: "Please enter a valid email.",
            validator: (email) => validator.isEmail(email)
        },
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Must be at least 8 characters'],
        validate: [
            {
              message: "Password must be at least 8 characters in length.",
              validator: (password) => password.length >= 8
            },
            {
              message: "Password must contain at least 1 uppercase character, number and symbol",
              validator: (password) => validator.isStrongPassword(password, 
                { minUppercase: 1, minSymbols: 1, minNumbers: 1 }
              )
            }
          ]
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
            this.invalidate("confirmPassword", "Does not match")
        }
        next()
    })

// * Before the user document is created, we want to replace 
// * the password with a hashed version.
// mongoose has a lifecycle for each document, e.g. validation, saving etc.
// this one runs before saving a document to the database.
userSchema
    .pre('save', function (next) {
    // 'this' refers to the doc you're about to save.
    // this line replaces the password with the hashed password.
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync())
    next() // this tells mongoose we're done.
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