const { ObjectID } = require('bson')
const { category, products } = require('../Model/connection')
const db = require('../Model/connection')

module.exports={


    getAllproducts:()=>{
        return new Promise(async(resolve, reject) => {
            try {
                let products = await db.products.find({})
                resolve(products)
                
            } catch (error) {
                console.log(error)
            }
            
        })
    },

    getProductData:()=>{
        return new Promise(async(resolve, reject) => {
            try {
                let products = await db.products.aggregate([
                    {
                        $project:{
                            name:'$name',
                            category:'$category',
                        }
                    }
                ])
                resolve(products)
                console.log(products);
            } catch (error) {
                console.log(error);
            }
        })
    },

    addProducts:(product)=>{
        console.log(product)
        return new Promise(async(resolve, reject) => {
            try {
              let data = await db.products(product)
              data.save()
                resolve(data._id)

            } catch (error) {
                
            };
        })
       
    },

    getProductdetails:(proId)=>{
        return new Promise((resolve, reject) => {
            try {
                db.products.findOne({_id:proId}).then((product)=>{
                    resolve(product)
                })
            } catch (error) {
                console.log(error)
            }
           
        })
    },

    updateProduct:(proId,proBody)=>{
        return new Promise(async(resolve, reject) => {
                await db.products.updateOne({_id:proId},{
                    
                    $set: {
                        name: proBody.name,
                        brand:proBody.brand,
                        category: proBody.category,
                        subCategory: proBody.subCategory,
                        quantity: proBody.quantity,
                        price: proBody.price,
                        description: proBody.description

                    }
                }).then((response)=>{
                    resolve()
                })
           
        })
    },

    deleteProduct:(proId)=>{
        return new Promise((resolve, reject) => {
            db.products.deleteOne({_id:proId}).then(()=>{
                resolve()
            })
        })
    },

    getCategory:()=>{
        return new Promise(async(resolve, reject) => {
            let category = await db.category.find({})
            resolve(category)
        })
    },
    getCategorydetails:(catId)=>{
        return new Promise((resolve, reject) => {
            db.category.findOne({_id:catId}).then((response)=>{
                resolve(response)
            })
        })
    },
    updateCategory:(catId,category)=>{
        return new Promise((resolve, reject) => {
            db.category.updateOne({_id:catId},{
                $set:{
                    categories:category.categories
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    addCategory:(categorys)=>{
        return  new Promise(async(resolve, reject) => {


        db.category.find({categories:categorys.categories}).then(async(response)=>{

            if(response.length==0){
                try {
                    await db.category(categorys).save()
                    resolve()
                    
                } catch (error) {
                    console.log(error);
                }
            }else{
                let response = false
                resolve(response)
            }
        })
     
           
        })
    },

    deleteCategory:(catId)=>{
        return new Promise((resolve, reject) => {
            try {
                db.category.deleteOne({_id:catId}).then(()=>{
                    resolve()
                })
            } catch (error) {
                console.log(error);
            }
        })
    }
    
}