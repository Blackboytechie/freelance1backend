const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[
        {
            name:{
                type:String,
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
            image:{
                type:String,
                required:true
            },

        }
    ],
    totalPrice:{
        type:Number,
        required:true
    },
    shippingAddress:{
        name:{
            type:String,required:true
        },
        mobileNo:{
            type:Number,required:true
        },
        houseNo:{
            type:Number,required:true
        },
        street:{
            type:String,required:true
        },
        landmark:{
            type:String,required:true
        },
        postalCode:{
            type:Number,required:true
        }
    },
    paymentMethod:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        Default:Date.now
    }
})

const Order = mongoose.model('Order',orderSchema);
module.exports = Order;