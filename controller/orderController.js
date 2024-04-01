const Products = require('../model/productsModel');
const Users = require('../model/userModel');
const Cart = require('../model/cartModel');
const Orders = require('../model/orderModel');

// place order
const placeOrder = async (req, res) => {
    try {
        console.log('im in place order');//-----------
        const userId = req.session.user.id;
        console.log('req.body=' + req.body); //-----------
        console.log('userId=' + userId); //-----------
        console.log('req.body.index=' + req.body.index); //-----------
        console.log('req.body.paymentMethod=' , req.body.paymentMethod);//----------- 
        const {
            subtotal,
            paymentMethod,
        } = req.body;
        const index = req.body.index;


        const cartData = await Cart.findOne({ user: userId }).populate('products.productId');
        console.log('car place order', cartData);//-----------
        let products = cartData.products
        // console.log(' products ', products);//-----------
        let lessQuantity = 0
        let size = 0
        products.forEach((product) => {
            if (product.quantity > product.productId.totalStock) {
                // console.log('product.productId.stock',product.productId.stock)//------------------
                // console.log('product.productId',product.productId)//------------------
                lessQuantity = product.productId.name;
            }
        });

        console.log('lessQuantity', lessQuantity)//--------------

        if (lessQuantity && lessQuantity !== 0) {
            res.json({ quant: true, lessQuantity });
            console.log('within if case');//--------------------------
        } else {
            console.log('within else case');//--------------------------

            const user = await Users.findOne({ _id: userId });
            console.log('user', user);//--------------------------

            const status = paymentMethod == "cashOnDelivery" ? 'placed' : 'pending';
            const address = user.addresses[index];
            console.log('addresses', user.addresses);//--------------
            const date = Date.now();
            const order = new Orders({
                user: userId,
                products: products,
                totalAmount: subtotal,
                status: status,
                paymentMethod: paymentMethod,
                deliveryAddress: address
            })

            const orderDetails = await order.save();
            const orderId = orderDetails._id;

            if (orderDetails.status == 'placed') {             
                for (let i = 0; i < products.length; i++) {
                    const productId = products[i].productId._id;
                    const productTotalStock = products[i].productId.totalStock;
                    const productCartQuantity =products[i].quantity;
                    const updatedQuantity = productTotalStock-productCartQuantity;

                    console.log('productTotalStock',productTotalStock);//------------
                    console.log('updatedQuantity',updatedQuantity);//------------
                    console.log('productId',productId);//------------
                    console.log('productCartQuantity',productCartQuantity);//------------
                    const updateProduct = await Products.findByIdAndUpdate({_id:productId});
                     console.log("updateProduct", updateProduct);//--------------------------
                     updateProduct.totalStock+= -updatedQuantity;
                     updateProduct.save()
                     console.log("updateProduct  111111111", updateProduct);//--------------------------


                    }
                            
                }
                await Cart.deleteOne({ user: userId });
                res.json({ ok: true, orderId });
            }

    } catch (error) {
        console.log(error);
    }
}

//order success
const loadOrderSuccess = (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log('orderId', orderId);//-----------
        res.render('orderSuccess', { orderId });
    } catch (error) {
        console.log(error);
    }
}

// order details
const loadOrderDetails = async (req,res)=>{
try {

    console.log('im in order details'); //--------------
   const orderId = req.query.id;
   const userId = req.session.user.id;
   console.log('userId',userId); //--------------
   console.log('query id',orderId); //--------------

const orderDetails = await Orders.findOne({user:userId});
res.render('orderDetails',{orderDetails});
    
} catch (error) {
    console.log(error);
}
}


module.exports = {
    placeOrder,
    loadOrderSuccess,
    loadOrderDetails
}