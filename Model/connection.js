const { ObjectID } = require('bson')
const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const db=mongoose.createConnection('mongodb://localhost:27017/Ecommerce')

db.on('error',(err)=>{
    console.log(err)
})

db.once('open',()=>{
    console.log('database connected');
})

const productSchema = new mongoose.Schema({
    name:String,
    brand:String,
    category:String,
    quantity:Number,
    price:Number,
    description:String
})

const userSchema = new mongoose.Schema({
    fName:String,
    lName:String,
    email:String,
    password:String,
    contactNo:String,
    createdAt:{
        type:Date,
        default:new Date()
    },
    status:{
        type:Boolean,
        default:true
    }
})

const adminSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

const categorySchema = new mongoose.Schema({
    categories:String
})

const cartSchema = new mongoose.Schema({
    user: ObjectId,
    cartProducts : [{
        item:mongoose.Types.ObjectId,
        quantity:Number
    }]
})

const countrySchema = new mongoose.Schema({
        name:String,
        code:String
})

const addressSchema = new mongoose.Schema({
        user:mongoose.Types.ObjectId,
        address:[{
            fName:String,
            lName:String,
            address:String,
            landmark:String,
            town:String,
            country:String,
            postcode:Number,
            mobile:Number,
            email:String,
        }]
       
})

const orderSchema = new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    orders:[{
        fName:String,
        lname:String,
        mobile:Number,
        paymentMethod:String,
        productDetails:[{}],
        totalPrice:Number,
        shippingAddress:Object,
        createdAt:{
            type:Date,
            default:new Date()
        },
        status:{
        type:Boolean,
        default:true
    }
    }],
    

})


module.exports={
    products:db.model('product',productSchema),
    users:db.model('users',userSchema),
    category:db.model('category',categorySchema),
    admin:db.model('admin',adminSchema),
    cart:db.model('cart',cartSchema),
    country:db.model('country',countrySchema),
    address:db.model('address',addressSchema),
    order:db.model('orders',orderSchema)


}