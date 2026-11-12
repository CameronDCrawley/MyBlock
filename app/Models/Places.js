const mongoose = require('mongoose')
let placesSchema = new mongoose.Schema({

   name:String,
   type: String,
   kind:String,
   address:String,
   zip:String,
   lat:{type:Number, required:true},
   lng:{type:Number, required:true},
   hours:String,
   phone:String,
   source:String,
   ownerId:{type:mongoose.Schema.Types.ObjectId, ref: 'User',default:null},



}, {timestamps:true});



module.exports= mongoose.model('Places',placesSchema,'Places')