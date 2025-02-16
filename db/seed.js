// * This program is responsible for adding (seeding) data to our database
// * for development purposes.
import mongoose from "mongoose"
import Member from '../models/members.js'
import members from "../data.js"
import User from '../models/user.js'
// ? We definitely need a mongoose model (destinations, to create our data in the db)
// ? We also need to use mongoose to connect to MongoDB
// ? we need a data.js file to use to seed our data.

import dotenv from 'dotenv'
dotenv.config()

async function seed() {
  // This function should seed our database with data from our file.
  console.log('Connecting to database 🌱')
  await mongoose.connect(process.env.MONGODB_URI)
  
  // ! This code wipes the database clean.
  console.log('Clearing database... 🧹')
  await mongoose.connection.db.dropDatabase()

  // ! This code wipes the database clean.
  // console.log('Clearing database... 🧹')
  await mongoose.connection.db.dropDatabase()

  // ! We now need to make sure all divisions have a user field set.
  // ? Let's seed a user first, and then use that user for our members.
  const user = await User.create({
    username: "Kam",
    email: "kamran.raja@fma.com",
    password: "Kam1234$Abc",
    confirmPassword: "Kam1234$Abc",
    role: "Admin"
  })

  // ? Add the user to our member
  members.forEach((member) => {
    // add the user to this member
    member.user = user
  })

  // This seeds new data
  console.log('Seed the new member 🌱')
  const newMember = await Member.create(members)
  console.log(newMember)
  
  // This ends the connection to database
  console.log('Goodbye! 🌱')
  await mongoose.disconnect()
}

seed()