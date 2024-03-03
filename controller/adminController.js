require('dotenv').config();
const Users = require('../model/userModel');
const Products = require('../model/productsModel');


//load dashboard
const loadDashboard = (req, res) => {
    try {                     
        res.render('dashboard');
    } catch (error) {
        console.log(error);
    }

}




//admin login
const adminLoginLoad = (req, res) => {
    try {
        res.render('aaadmin-login');  
    } catch (error) {
        console.log(error);
    }

}


//verify login

const verifyAdminLogin = (req, res) => {
    try {
        const Email = process.env.EMAIL;
        const Password = process.env.PASSWORD;
        console.log(`Email = ${Email}`)//--------------------------------------------------------------------

        const email = req.body.Email;
        const password = req.body.Password;
        console.log(` admin entered email = ${email}`)//--------------------------------------------------------------------

        if (Email == email) {
            if (Password == password) {               
                req.session.admin = {
                    email:email,
                    password:password 
                }
                console.log('session from admin control',req.session.admin);//-----------------------------
                res.redirect('/admin');
            } else {
                req.flash('passwordError', 'Incorrect Password');
                res.redirect('/admin/login');
            }
            
        } else {
            console.log("email error");
            req.flash('emailError', 'Invalid Email');
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error);
    }
}

// admin logout
const loadLogout=(req,res)=>{
    try {
        console.log('admin session a',req.sssion.admin);//----------
        req.sssion.admin=null;
        console.log('admin session b',req.sssion.admin);//-------------

        res.redirect('/admin')
    } catch (error) {
        console.log(error);
    }

}

// load customers
const customersLoad = async (req, res) => {
try {
    const userData = await Users.find({})
    // console.log(`userData = ${userData}`)//--------------------------------------------------------------------------------
    res.render("userManagement",{userData});
} catch (error) {
    console.log(error);
}
}



// block user
const blockUser = async (req,res)=> {
try {
    const id = await req.body.id; 
    console.log(`id from block user ${id} `); //----------------------------------------------------------------------

    if (id){
    const user = await Users.findOne({_id:id});

    if (user){
        if (user.isBlocked){
        await Users.updateOne({_id:id},{$set:{isBlocked:false}});
        console.log(`user blocked `); //---------------------------------------------------------------
        res.json({block:true});
        
    }else{
            await Users.updateOne({_id:id},{$set:{isBlocked:true}});  
            console.log(`user unblocked`); //---------------------------------------------------------------
            res.json({block:true});
        }
    }
}else{
    console.log('id not getting in the block user');//------------------------------------------
}  
} catch (error) {
    console.log(error);
}


}









module.exports = {
    adminLoginLoad,
    loadDashboard,
    verifyAdminLogin,
    customersLoad,
    blockUser,
    loadLogout
 
    


}