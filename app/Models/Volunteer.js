const { name } = require("ejs")

let volunteerSchema = new mongoose.Schema({

   name:String,
   eventDate: Date,
   eventTime:String,
   eventLocation:String,


})

module.exports= mongoose.model('Volunteer',volunteerSchema,'volunteer')
