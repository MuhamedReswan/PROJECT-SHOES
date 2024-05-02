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
            console.log('order addres', address);//--------------
            const date = Date.now();
            const order = new Orders({
                user: userId,
                products: products,
                totalAmount: subtotal,
                status: status,
                paymentMethod: paymentMethod,
                deliveryAddress: address,
            })

            const orderDetails = await order.save();
            const orderId = orderDetails._id;

            if (orderDetails.status == 'placed') {             
                for (let i = 0; i < products.length; i++) {
                    const productId = products[i].productId._id;
                    const productTotalStock = products[i].productId.totalStock;
                    const productCartQuantity =products[i].quantity;
                    // const updatedQuantity = productTotalStock-productCartQuantity;

                    console.log('productTotalStock',productTotalStock);//------------
                    // console.log('updatedQuantity',updatedQuantity);//------------
                    console.log('productId',productId);//------------
                    console.log('productCartQuantity',productCartQuantity);//------------
                    const updateProduct = await Products.findByIdAndUpdate({_id:productId});
                     console.log("updateProduct", updateProduct);//--------------------------
                     updateProduct.totalStock-= productCartQuantity;
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
const orderDetails = await Orders.findOne({user:userId,_id:orderId}).populate('user').populate('products.productId');
console.log('orderDetails=',orderDetails)//-------------
res.render('orderDetails',{orderDetails});
} catch (error) {
    console.log(error);
}
}


// order single product user
const orderSingleProduct = async (req, res)=>{
    try {
       const orderId = req.query.id;
       const userId = req.session.user.id
       const orderData = await Orders.findOne({_id:orderId,user:userId}).populate('user').populate('products.productId')
       console.log('orderId',orderId)//---------------
       console.log('userId',userId)//---------------
       console.log('orderData',orderData)//---------------
       if(orderData){
        res.status(200)
        .json({orderData})
       }else{
        res.status(404).json({ error: 'Order not found' });
       }
    } catch (error) {
        console.log(error)
    }
}



// change product order status single
const updateSingleOrderStatus = async ()=>{
    try {
        console.log('im in updateSingleOrderStatus');//-------------
        console.log('req.body',req.body);//-------------------------
        const {orderId,productId,userId,index}=req.body
    } catch (error) {
        
    }
    console.log(error)
}

//admin---------------------------------------------------------------------------------------------


//admin order 
const adminOrders = async (req, res)=>{
    try {

        const ordersDetails = await Orders.find({}).populate('user').populate('products.productId');
        console.log('admin ordersDetails' ,ordersDetails);//------------------
        res.render('orders',{ordersDetails})
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



//single order admin
const singleOrderDetails = async (req, res)=>{
    try {
        console.log('in single orders');//------------------
        const orderId = req.query.id;
        const singleOrder = await Orders.findOne({_id:orderId}).populate('user').populate('products.productId');
        console.log('orderDetails-single',JSON.stringify(singleOrder));//-----------------
        res.render('singleOrders',{singleOrder});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// single change status admin
const changeStatusSingle = async (req,res)=>{
    try {
        const {}=req.body
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    placeOrder,
    loadOrderSuccess,
    loadOrderDetails,
    adminOrders,
    singleOrderDetails,
    changeStatusSingle,
    orderSingleProduct,
    updateSingleOrderStatus
}