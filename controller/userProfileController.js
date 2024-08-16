const Users = require('../model/userModel');
const Orders = require('../model/orderModel');
const Wallet = require('../model/walletModel');
const bcrypt = require('bcrypt');
const { securedPassword } = require('../controller/userController');

// Add new address to user profile
const addAddress = async (req, res, next) => {
    try {
        const { name, mobile, address, district, city, pincode, state, country } = req.body;
        const userId = req.session.user.id;
        const newAddress = { name, mobile, address, district, city, pincode, state, country };

        // Add address to the user's address list
        await Users.updateOne({ _id: userId }, { $push: { addresses: newAddress } });

        // Redirect to the checkout page after address is added
        res.redirect('/checkout');
    } catch (error) {
        console.error('Error adding address:', error.message);
        next(error);
    }
}

// Load user profile with orders and wallet details
const loadProfile = async (req, res, next) => {
    try {
        const userId = req.session.user.id;

        // Fetch user orders, wallet details, and user info
        const orders = await Orders.find({ user: userId }).populate('products.productId').sort({ createdAt: -1 });
        const walletDetails = await Wallet.findOne({ user: userId });
        const user = await Users.findOne({ _id: userId });

        // Sort wallet transactions by date
        walletDetails.transactions.sort((a, b) => b.date - a.date);

        // Render profile page with fetched data
        res.render('addProfile', { orders, user, walletDetails });
    } catch (error) {
        console.error('Error loading profile:', error.message);
        next(error);
    }
}

// Update user profile (name and mobile)
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const { name, mobile } = req.body;

        // Check if the new name already exists for another user
        const nameExist = await Users.findOne({ name });
        const currentUser = await Users.findOne({ _id: userId });

        if (nameExist && nameExist.name !== currentUser.name) {
            return res.status(409).json({ nameAlready: true });
        }

        // Update user profile
        await Users.updateOne({ _id: userId }, { $set: { name, mobile } }, { new: true });

        res.status(200).json({ updated: true });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        next(error);
    }
}

// Change user password
const changePassword = async (req, res, next) => {
    try {
        const { newPassword, oldPassword } = req.body;
        const userId = req.session.user.id;

        const user = await Users.findOne({ _id: userId });

        // Compare old password with existing password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (isMatch) {
            // Hash new password and update it in the database
            const hashPassword = await securedPassword(newPassword);

            await Users.updateOne({ _id: userId }, { $set: { password: hashPassword } });

            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false });
        }
    } catch (error) {
        console.error('Error changing password:', error.message);
        next(error);
    }
}

// Load a specific address for editing
const editAddress = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const addressIndex = req.query.index;

        // Find user and get the specific address by index
        const user = await Users.findOne({ _id: userId });
        const address = user.addresses[addressIndex];

        // Render the edit address page with the fetched address data
        res.render('editAddress', { address });
    } catch (error) {
        console.error('Error editing address:', error.message);
        next(error);
    }
}

// Update an existing address
const updateAddress = async (req, res, next) => {
    try {
        const { name, mobile, address, district, city, pincode, country, state, id } = req.body;
        const userId = req.session.user.id;

        // Find and update the specific address using its ID
        await Users.findOneAndUpdate(
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
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Address updated successfully'
        });
    } catch (error) {
        console.error('Error updating address:', error.message);
        next(error);
    }
}

module.exports = {
    addAddress,       // Add new address to user profile
    loadProfile,      // Load user profile with orders and wallet details
    updateProfile,    // Update user profile (name and mobile)
    editAddress,      // Load a specific address for editing
    updateAddress,    // Update an existing address
    changePassword    // Change user password
}
