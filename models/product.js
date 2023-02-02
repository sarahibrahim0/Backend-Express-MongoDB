
const mongoose = require('mongoose')

// or if its not ESmodule

require('dotenv').config()

const productSchema = mongoose.Schema({
    name:{
      type: String,
      // required: true
    },
    description: {
      type:String,
      // required: true
    },
    richDescription:{
     type: String,
     default : ''
    },

    image:{
      type: String,
     },

     images:[{
      type: String,

     }],
     brand :{
      type: String,
      default : ''
     },
     price: Number,

     category:{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Category'
     } ,

     countInStock:{
      type: Number,
      // required: true,
      // min: 0,
      // max: 200
    },
    rating:{
      type:Number,
      default : 0
     },
      numbReviews:{
        type:Number,
        default : 0
       },
       isFeatured:{
        type:Boolean,
        default : false
       },

       dateCreated:{
        type:Date,
        default : Date.now
       },

  })


  productSchema.virtual('id').get(function (){

    return this._id.toHexString()

  });

  productSchema.set('toJSON',{
  virtuals : true
  })


  exports.Product = mongoose.model('Product' , productSchema)
