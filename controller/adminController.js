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

        if (Email === email) {
            if (Password === password) {               
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
        console.log('im in logout admin');//--------------------
        console.log('admin session a',req.session.admin);//----------
        req.session.admin=null;
        console.log('admin session b',req.session.admin);//-------------

        res.redirect('/admin')
    } catch (error) {
        console.log(error);
    }

}

// load customers
const customersLoad = async (req, res) => {
try {

    let page=1;
    let limit = 6;
    if(req.query.id){
        page=req.query.id
    }
    let next = page+1
    let previous = page>1 ? page-1 : 1
    let start = (page-1)*limit
    console.log('start',start);//---------------------
    const count = await Users.find({}).count()

let totalPage= Math.ceil(count/limit)
if(next>totalPage){
    next=totalPage
}

    const userData = await Users.find({})
    .limit(limit)
    .skip((page-1)*limit)
    .exec()
    // console.log(`userData = ${userData}`)//--------------------------------------------------------------------------------
    res.render("userManagement",{
        users:userData,
        page:page,
    previous:previous,
        next:next,
        totalPage:totalPage,
        start:start
    });
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
    res.status(404).json({ error: 'user not loged' });
}  
} catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
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