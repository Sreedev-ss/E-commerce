const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
require('dotenv').config()

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Ecommerce"
};

const db = mongoose.createConnection(process.env.MONGODBURL,options)

db.on('error', (err) => {
    console.log(err)
})

db.once('open', () => {
    console.log('database connected');
})

const productSchema = new mongoose.Schema({
    name: String,
    brand: String,
    category: String,
    quantity: Number,
    price: Number,
    description: String
})

const userSchema = new mongoose.Schema({
    fName: String,
    lName: String,
    email: String,
    password: String,
    contactNo: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
    status: {
        type: Boolean,
        default: true
    },
    coupon: Array,
    wallet: Array
})

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const categorySchema = new mongoose.Schema({
    categories: String,
    offer:Number
})

const cartSchema = new mongoose.Schema({
    user: ObjectId,
    cartProducts: [{
        item: mongoose.Types.ObjectId,
        quantity: Number
    }]
})

const countrySchema = new mongoose.Schema({
    name: String,
    code: String
})

const addressSchema = new mongoose.Schema({
    user: mongoose.Types.ObjectId,
    address: [{
        fName: String,
        lName: String,
        address: String,
        landmark: String,
        town: String,
        country: String,
        postcode: Number,
        mobile: Number,
        email: String,
    }]

})

const orderSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    orders: [{
        fName: String,
        lname: String,
        mobile: Number,
        paymentMethod: String,
        productDetails: [{}],
        totalQuantity: Number,
        totalPrice: Number,
        shippingAddress: Object,
        createdAt: Date,
        couponDiscount:{
            type:Number,
            default:0
        },
        couponName:{
            type:String,
            default:null
        },
        paymentStatus: {
            type: String,
            default: 'Pending'
        },
        status: {
            type: Boolean,
            default: true
        }
    }],
})

const coupenSchema = new mongoose.Schema({
    coupon: String,
    discountType: String,
    amount: Number,
    amountValidity: String,
    cappedAmount:Number,
    percentage: Number,
    description: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
    validityTill: Date,
    usageValidity: Number

})

const bannerSchema = new mongoose.Schema({
        mainBannerTitle: String,
        mainBannerDescription: String,
        mainBannerCategory : String,
        checked:{
            type:Boolean,
            default:true
        }
})


const advertisementBanner = new mongoose.Schema({
        advBannerTitle:String,
        advBannerSpecify : String,
        category:String, //like Top product , Featured , Clearance , Top in the category
        checked:{
            type:Boolean,
            default:true
        }
})

const advertisementBannerMini = new mongoose.Schema({
    advBannerTitleMini : String,
    advBannerofferMini : Number,
    advBannerAmountMini : Number,
    advBannerSpecifyMini : String,
    checked:Boolean
})

module.exports = {
    products: db.model('product', productSchema),
    users: db.model('users', userSchema),
    category: db.model('category', categorySchema),
    admin: db.model('admin', adminSchema),
    cart: db.model('cart', cartSchema),
    country: db.model('country', countrySchema),
    address: db.model('address', addressSchema),
    order: db.model('orders', orderSchema),
    coupen: db.model('coupen', coupenSchema),
    banner : db.model('banner',bannerSchema),
    advertisementBanner : db.model('advBanner',advertisementBanner),
    advertisementBannerMini : db.model('advBannerMini',advertisementBannerMini)

}