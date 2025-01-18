// * This file allows to me create a model for a particular collection.
// * This is so all profiles are consistent (have the same fields).

import mongoose from "mongoose";

// create a schema (consistent format) for my destination collection
const memberSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    gender: {
        type: String, 
        required: true,
        enum: ['Male', 'Female']
    },
    DOB: { 
        type: String, 
        required: true
    },
    weight: { 
        type: String, 
        required: true
    },
    belt: { 
        type: String, 
        required: true,
        enum: ['Black', 'Brown', 'Purple', 'Blue', 'White']
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

