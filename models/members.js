// * This file allows to me create a model for a particular collection.
// * This is so all profiles are consistent (have the same fields).

import mongoose from "mongoose";
import validator from "validator"

// create a schema (consistent format) for my destination collection
const memberSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, 'Please provide your profile name.']
    },
    email: {
            type: String,
            required: [true, 'Email is required'], // Ensures email is mandatory
            unique: true, // Ensures email is unique in the database
            lowercase: true, // Converts email to lowercase before saving
            trim: true, // Removes whitespace
            validate: {
                validator: (email) => validator.isEmail(email),
                message: "Please enter a valid email."
            }
    },
    gender: {
        type: String, 
        required: [true, 'Please enter your gender.'],
        enum: {
            values: ['Male', 'Female'],
            message: 'Please enter "Male" or "Female".'
        },
    },
    DOB: { 
        type: String,
        required: [true, 'Please enter your Date of Birth.'],
    },
    weight: { 
        type: String, 
        required: [true, 'Please enter your weight in kg.'],
    },
    belt: { 
        type: String, 
        required: [true, 'Please enter your belt rank.'],
        enum: {
            values: ['Black', 'Brown', 'Purple', 'Blue', 'White', 'black', 'brown', 'purple', 'blue', 'white'],
            message: 'Your belt rank must be one of "Black", "Brown", "Purple", "Blue", "White"'
        }
    },
    headshot: {
        type: String,
    },
    instagram: {
        type: String,
    },
    facebook: {
        type: String,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

// export the schema as a model
// ! The first argument to the model method MUST be a string pascalcase (uppercase words), singular 
export default mongoose.model('Members', memberSchema)

