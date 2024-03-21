const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Cart = require('../model/cartModel');

// place order
const placeOrder = async (req, res)=>{
    try {
        console.log('im in place order');//-----------
        const userId = req.session.user.id;
        console.log('req.body='+req.body); //-----------
        console.log('userId='+userId); //-----------
        console.log('req.body.index='+req.body.index); //-----------
        console.log('req.body.paymentMethod='+req.body.paymentMethod);//----------- 
const {
    subtotal,
    paymentMethod,
index
} = req.body;


const cartData = await Cart.findOne({user:userId}).populate('products.productId');
console.log('car place order',cartData);//-----------
let products = cartData.products
console.log(' products ',products);//-----------
let lessQuantity=0
products.forEach((product) => {
    if (product.quantiy>product.productId.stock[product.size]){
console.log('product.productId.stock',product.productId.stock)//------------------
console.log('product.productId',product.productId)//------------------
console.log('product.size',product.size)//------------------
lessQuantity=product.productId.name;
    }
});
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    placeOrder
}