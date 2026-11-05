const mongoose = require('mongoose')
let orgSchema = new mongoose.Schema({

   organization:String,
   eventDate: Date,
   eventTime:String,
   eventLocation:String,


});



module.exports= mongoose.model('Organization',orgSchema,'org')


