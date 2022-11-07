const db= require('../Model/connection')

module.exports={

    doAdminlogin:(adminData)=>{
        console.log(adminData);
        return new Promise(async(resolve, reject) => {
            let admin = await db.admin.findOne({email:adminData.email})
            let response={}
            if(admin){
                response.admin = admin;
                response.status = true;
                resolve(response)
            }else{
                resolve({status:false})
            }

        })
}
}