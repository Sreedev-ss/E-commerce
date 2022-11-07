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


module.exports={
    products:db.model('product',productSchema),
    users:db.model('users',userSchema),
    category:db.model('category',categorySchema),
    admin:db.model('admin',adminSchema)


}