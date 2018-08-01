const mongoose = require("mongoose")
//configure schema
const Schema = mongoose.Schema;
const trailSchema = new Schema({
    name:  String,
    image: String,
    difficulty: String,
    description: String,
    imageId: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt:{
      type: Date, 
       default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
        ]
    
    
  });

module.exports = mongoose.model("Trail", trailSchema)