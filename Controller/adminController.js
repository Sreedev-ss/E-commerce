const productHelpers = require('../helpers/productHelpers')
const userHelpers = require('../helpers/userHelpers')
const adminHelpers = require('../helpers/adminHelpers')
const data = { layout:'admin_layouts' }
const db = require('../Model/connection')
const { renderFile } = require('ejs')


module.exports={

        getAdminpanel:function(req, res, next) {
          let admin = req.admin
          if(admin==null){
            res.redirect('/admin_panel/admin_login')
          }else{
            res.render('admin/admin_panel',{admin,layout:data.layout})
          }
          },

        getAdminlogin:(req,res)=>{
            res.render('admin/admin_login',data)
        },
        postAdminlogin:(req,res)=>{
            adminHelpers.doAdminlogin(req.body).then((response)=>{
              console.log(response.status);
              if(response.status){
                req.session.admin = response.admin._id
                res.send({admin:'success'})
              }else{
                res.send({admin:'failed'})
              }
            })
        },

        getAdminlogout:(req,res)=>{
          req.session.admin = null
          res.redirect("/admin_panel/admin_login")
        },


        getProduct:(req,res)=>{
          let admin = req.admin
            productHelpers.getAllproducts().then((products)=>{
              productHelpers.getCategory().then((category)=>{
          
                res.render('admin/productManagement',{admin,products,category,layout:data.layout})
              })
            })
          },

        getAddproduct:async(req,res)=>{
          let admin = req.admin
            productHelpers.getCategory().then((category)=>{
            res.render('admin/add_products',{admin,category,layout:data.layout})
            })
          },

        postAddproduct:(req,res)=>{
            productHelpers.addProducts(req.body).then((insertedId)=>{
              console.log(insertedId)
              let image = req.files.Image
              let imageName = insertedId
              image.mv('./public/productImages/' + imageName + '.jpg', (err, done) => {
                if (!err) {
                  res.redirect('/admin_panel/products')
                } else {
                  console.log(err)
                }
              })
            })
        },

        getEditproduct:async(req,res)=>{
          let admin = req.admin
            let products = await productHelpers.getProductdetails(req.params.id)
            productHelpers.getCategory().then((category)=>{
            res.render('admin/edit_products',{admin,products,category,layout:data.layout})
            })
          },

        postEditproduct:async(req,res)=>{
            let imageName = req.params.id
            await productHelpers.updateProduct(req.params.id, req.body).then(() => {
          
              if (!req?.files?.Image) {
                res.redirect('/admin_panel/products')
              }
              else if (req.files.Image) {
                let image = req.files.Image
                image.mv('./public/productImages/' + imageName + '.jpg')
                res.redirect('/admin_panel/products')
          
              }
            })
          },

        getDeleteproduct:(req,res)=>{
            let proId = req.params.id
              productHelpers.deleteProduct(proId).then(()=>{
                res.redirect('/admin_panel/products')
              })
          },

        getCategory:(req,res)=>{
          let admin = req.admin
            productHelpers.getCategory().then((category)=>{
              res.render('admin/categoryManagement',{admin,category,layout:data.layout})
            })
          },

        getAddcategory:(req,res)=>{
          let admin = req.admin
            res.render('admin/add_category',data)
          },

        postAddcategory:(req,res)=>{
            productHelpers.addCategory(req.body).then((response)=>{
              if(response==false){
                res.send({value:"error"})
              }else{
                res.send({value:'nil'})
              // res.redirect('/admin_panel/category_management')
              }
            })
          },

        getEditcategory:async (req,res)=>{
          let admin = req.admin
          let category = await productHelpers.getCategorydetails(req.params.id)
            res.render('admin/edit_category',{admin,category,layout:data.layout})
        },

        postEditcategory:(req,res)=>{
          console.log(req.body);
          let catId = req.params.id
          productHelpers.updateCategory(catId,req.body).then(()=>{
            res.send({value:"Success"})
          })
        },

        getDeletecategory:(req,res)=>{
            catId=req.params.id
            productHelpers.deleteCategory(catId).then(()=>{
              res.redirect('/admin_panel/category_management')
            })
        },

        getUser:(req,res)=>{
          let admin = req.admin
            userHelpers.getAllusers().then((users)=>{
              res.render('admin/userManagement',{admin,users,layout:data.layout})
            })
          },

        getAdduser:(req,res)=>{
          let admin = req.admin
            res.render('admin/add_users',{admin,layout:data.layout})
          },

        postAdduser:(req,res)=>{
            userHelpers.addUser(req.body).then(()=>{
              res.redirect('/admin_panel/user_management')
            })
          },

        getEdituser:async(req,res)=>{
          let admin = req.admin
            let user = await userHelpers.getUserdetails(req.params.id)
            res.render('admin/edit_users',{admin,user,layout:data.layout})
          },

        postEdituser:(req,res)=>{
            userHelpers.updateUser(req.params.id,req.body).then(()=>{
            res.redirect('/admin_panel/user_management')
          })
        },

        getBlockuser:(req,res)=>{
            let userId = req.params.id
            userHelpers.blockUser(userId).then(()=>{
              res.redirect('/admin_panel/user_management')
            })
          },

        getUnblockuser:(req,res)=>{
            let userId = req.params.id
            userHelpers.unblockUser(userId).then(()=>{
              res.redirect('/admin_panel/user_management')
            })
          }

}