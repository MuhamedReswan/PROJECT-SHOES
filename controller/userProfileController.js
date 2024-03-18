const Users = require('../model/userModel');


// add address
const addAddress = async (req, res) => {
    try {console.log('im add address');//------------
        console.log('req.body',req.body);//--------------
        const {name,mobile,address,district,city,pincode,state,country} =req.body;
        const userId = req.session.user.id;
        console.log('userId',userId);//------------
        const data = {name:name,mobile:mobile,address:address, district:district,city:city,pincode:pincode,state:state,country:country}
        const userData = await Users.findByIdAndUpdate({_id:userId},{$push:{addresses:{name:name,mobile:mobile,address:address, district:district,city:city,pincode:pincode,state:state,country:country}}})
        console.log('userData',userData);//------------
        res.redirect('/checkout');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




module.exports = {
    addAddress   
}