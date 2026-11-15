const mongoose = require('mongoose')


const eventSchema = new mongoose.Schema({
  title: {tyoe:String, required:true},
  description: String,
  date: {type:Date, required:true},
  startTime: String,
  endTime:String,
  spots:{type:Number,default:10},
  skills: [String],
  placeId: {type:mongoose.Schema.Types.ObjectId, ref:'Places', required:true},
  orgId: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  signup: [{type:mongoose.Schema.Types.ObjectId, ref:'user'}]
},{timestamps:true})


module.exports= mongoose.model('Event',eventSchema,'Events')