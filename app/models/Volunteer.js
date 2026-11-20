const mongoose = require('mongoose')

let volunteerSchema = new mongoose.Schema({

   name:String,
   eventDate: Date,
   eventTime:String,
   interests:[String],


})

module.exports= mongoose.model('Volunteer',volunteerSchema,'volunteer')
