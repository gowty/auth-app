var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
   post_id: {
     type: String,
   },
   author: {
     type: String,
   },
   date: {
     type: String,
   },
   time: {
     type: String,
   },
   timeStamp: {
     type: String,
   },
   title: {
     type: String,
   },
   status: {
     type: String,
   },
   categories: {
     type: String,
   },
   tags: {
     type: String,
   },
   image: {
     type: String,
   },
   content: {
     type: String
   }
});

module.exports = mongoose.model("blog", blogSchema);
