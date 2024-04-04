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
        const orders = await Orders.find({user:userId});
        console.log('orders',orders)//----------------------
        res.render('addProfile',{orders})
    } catch (error) {
        console.log(error)
    }
}



module.exports = {
    addAddress,
    loadProfile  
}