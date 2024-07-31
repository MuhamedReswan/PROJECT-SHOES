const Users = require('../model/userModel');
const Orders = require('../model/orderModel');
const Wallet = require('../model/walletModel');
const bcrypt = require('bcrypt');
const { securedPassword } = require('../controller/userController')



// add address
const addAddress = async (req, res,next) => {
    try {

        const { name, mobile, address, district, city, pincode, state, country } = req.body;
        const userId = req.session.user.id;
        const data = { name: name, mobile: mobile, address: address, district: district, city: city, pincode: pincode, state: state, country: country }

        const userData = await Users.updateOne(
            { _id: userId },
            { $push: { addresses: data } })

        res.redirect('/checkout');

    } catch (error) {
 console.log(error.message);
        next(error); 
    }
}


// profile 
const loadProfile = async (req, res,next) => {
    try {
        const userId = req.session.user.id;
        const orders = await Orders.find({ user: userId }).populate('products.productId').sort({createdAt:-1});
        const walletDetails = await Wallet.findOne({ user: userId }).sort({createdAt:-1});
        const user = await Users.findOne({ _id: userId });
        
        walletDetails.transactions.sort((a,b)=>b.date-a.date);

        console.log("wallet in controller",walletDetails)//----------------------------------
        res.render('addProfile', { orders, user, walletDetails });
    } catch (error) {
 console.log(error.message);
        next(error); 
    }
}


// update profile
const updateProfile = async (req, res,next) => {
    try {
        const userId = req.session.user.id;
        const name = req.body.name;
        const mobile = req.body.mobile;
        console.log('body update profile', req.body);//-----------------
        const nameExist = await Users.findOne({ name: name });
        const currentUser = await Users.findOne({ _id: userId });
        console.log('currentUser', currentUser)//--------------------
        console.log('nameExist', nameExist)//--------------------
        if (nameExist && nameExist.name !== currentUser.name) {
            res.status(409).json({ nameAlready: true });
        }
        const updatedProfile = await Users.updateOne({ _id: userId }, { $set: { name: name, mobile: mobile } }, { new: true });
        console.log('updatedProfile', updatedProfile)//-----------------
        res.status(200).json({ updated: true });
    } catch (error) {
 console.log(error.message);
        next(error); 
    }
}



//change password
const changePassword = async (req, res,next) => {
    try {
        const { newPassword, oldPassword } = req.body;
        const userId = req.session.user.id;

        const user = await Users.findOne({ _id: userId });
        const existPassword = user.password;

        const match = await bcrypt.compare(oldPassword, existPassword);

        if (match) {
            const hashPassword = await securedPassword(newPassword)

            await Users.updateOne({
                _id: userId
            },
                {
                    $set: {
                        password: hashPassword
                    }
                })
            res.status(200).json({ success: true })
        } else {
            res.status(400).json({ success: false })
        }


    } catch (error) {
 console.log(error.message);
        next(error);    
     }

}



// edit adddress
const editAddress = async (req, res,next) => {
    try {
        console.log('im in edit address')//----------------
        const userId = req.session.user.id;
        const addressIndex = req.query.index;
        const user = await Users.findOne({ _id: userId });
        const address = user.addresses[addressIndex]
        console.log('addressIndex', addressIndex)//----------------------
        console.log('address', address)//----------------------
        console.log('user', user)//----------------------
        res.render('editAddress', { address })
    } catch (error) {
 console.log(error.message);
        next(error); 
    }
}



// update address
const updateAddress = async (req, res,next) => {
    try {
        console.log('im in update address');//-----------------------
        console.log('req.body', req.body)//--------------------
        const { name, mobile, address, district, city, pincode, country, state, id } = req.body;
        const userId = req.session.user.id;
        // const userAdress = await Users.findOne({_id:userId, 'addresses.name':name});
        // if (userAdress){
        //     res.json({nameAlready:true})
        // }else{
        const update = await Users.findOneAndUpdate(
            { _id: userId, 'addresses._id': id },
            {
                $set: {
                    'addresses.$.name': name,
                    'addresses.$.address': address,
                    'addresses.$.city': city,
                    'addresses.$.mobile': mobile,
                    'addresses.$.state': state,
                    'addresses.$.district': district,
                    'addresses.$.pincode': pincode,
                    'addresses.$.country': country
                }
            }, { new: true }
        )
        return res.json({
            success: true,
            error: false,
            message: 'Address updated successfully'
        })
        //console.log('update',update)//--------------------

        //}
        // console.log('userAdress',userAdress)//-------------------- 
    } catch (error) {
 console.log(error.message);
        next(error); 
    }
}


module.exports = {
    addAddress,
    loadProfile,
    updateProfile,
    editAddress,
    updateAddress,
    changePassword
}