const db = require('../Model/connection');

module.exports = {
    authInit: async (req, res, next) => {
        if(req.session?.user){
            let userData = await db.users.findOne({_id:req.session.user});
            if(userData.status==false){
                req.user = null;
            }else{
                req.user = userData;
            };
        }else{
            req.user = null;
        };

        if(req.session?.admin){
            let adminData = await db.admin.findOne({_id:req.session.admin});
            if(adminData.status==false){
                req.admin = null;
            }else{
                req.admin = adminData;
            };
        }else{
            req.admin = null;
        };
        next();
    },
    verifyUser: function (req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/user_signin');
        }
    },
    verifyAdmin: function (req, res, next) {
        if (req.admin) {
            next();
        } else {
            res.redirect('/admin_panel/admin_login');
        }
    },
    mustLogoutUser: function (req, res, next) {
        if (req.user) {
            res.redirect('/');
        } else {
            next();
        }
    },
    mustLogoutAdmin:(req,res,next)=>{
        if (req.admin) {
            res.redirect('/admin_panel');
        } else {
            next();
        }
    },

    verifyUserAPI: function (req, res, next) {
        if (req.user) {
            next();
        } else {
            res.send('unauthorized');
        }
    },
    mustLogoutAPI: function (req, res, next) {
        if (req.user) {
            res.send('Forbidden');
        } else {
            next();
        }
    },
};