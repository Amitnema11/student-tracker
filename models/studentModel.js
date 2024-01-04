const mongoose= require("mongoose")


const studentmodel= mongoose.Schema({
   // item: String,
   // date: String,
   // expense: String,
   // category: String,
   // tag: String,

   roll: String,
   name: String,
   date: String,
   gender: String,
   class: String,
   percentage: String,


   user:{type: mongoose.Schema.Types.ObjectId, ref: "collection4" }
}, {timestamps: true}
)



module.exports=mongoose.model("post",studentmodel)