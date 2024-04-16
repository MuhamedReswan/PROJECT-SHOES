const Users = require('../model/userModel');
const Orders = require('../model/orderModel');



// add address
const addAddress = async (req, res) => {
    try {console.log('im add address');//------------
        console.log('req.body',req.body);//--------------
        const {name,mobile,address,district,city,pincode,state,country} =req.body;
        const userId = req.session.user.id;
        console.log('userId',userId);//------------
        const data = {name:name,mobile:mobile,address:address, district:district,city:city,pincode:pincode,state:state,country:country}
        console.log('addressDAta',data);//---------------------------
        const userData = await Users.updateOne(
            {_id:userId},
            {$push:{addresses:data}})
        console.log('userData',userData);//------------
        res.redirect('/checkout');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


// profile 
const loadProfile = async (req,res)=>{
    try {
        const userId = req.session.user.id;
        console.log('profile working');//------------------
        console.log('userId',userId);//------------------
        const orders = await Orders.find({user:userId}).populate('products.productId');
        // const orders = await Orders.aggregate([{$match:{user:userId}},{$unwind:'$products'}]);
        const user =  await Users.findOne({_id:userId});
        console.log('user',user)//----------------------
        console.log('orders',orders)//----------------------
        res.render('addProfile',{orders,user});
    } catch (error) {
        console.log(error);
    }
}


// update profile
const updateProfile = async (req, res)=>{
    try {
        const userId = req.session.user.id;
        const name = req.body.name;
        const mobile = req.body.mobile;
        console.log('body update profile',req.body);//-----------------
         const nameExist = await Users.findOne({name:name});
         const currentUser = await Users.findOne({_id:userId});
         console.log('currentUser',currentUser)//--------------------
         console.log('nameExist',nameExist)//--------------------
         if(nameExist && nameExist.name !== currentUser.name ){
            res.status(409).json({nameAlready:true});
        }
       const updatedProfile = await Users.updateOne({_id:userId},{$set:{name:name,mobile:mobile}},{new:true});
       console.log('updatedProfile',updatedProfile)//-----------------
       res.status(200).json({updated:true});
    } catch (error) {
        console.log(error);
    }
}


// edit adddress
const editAddress = async (req, res)=>{
    try {
        console.log('im in edit address')//----------------
const userId = req.session.user.id;
const addressIndex = req.query.index;
const user = await Users.findOne({_id:userId});
const address = user.addresses[addressIndex]
console.log('addressIndex',addressIndex)//----------------------
console.log('address',address)//----------------------
console.log('user',user)//----------------------
        res.render('editAddress',{address})
        // res.render('editAddress')
    } catch (error) {
        console.log(error);
    }
} 



module.exports = {
    addAddress,
    loadProfile,
    updateProfile,
    editAddress  
}