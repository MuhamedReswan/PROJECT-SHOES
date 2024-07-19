require('dotenv').config();
const Users = require('../model/userModel');
const Products = require('../model/productsModel');
const Offers = require('../model/offerModel');
const Orders = require('../model/orderModel');
const Category = require('../model/categoryModel');




//load dashboard
const loadDashboard = async (req, res) => {
    try {
        console.log("within dashboard controller")//-----------

        let page = 1;
        if (req.query.id) {
            page = req.query.id
        }
        const limit = 6;
        const previous = page > 1 ? page - 1 : 1;
        let next = page + 1

        const count = await Orders.find({}).count()

        const totalPages = Math.ceil(count / limit)
        if (next > totalPages) {
            next = totalPages
        }

        const orders = await Orders.find({})
        let delivered = 0;
        let cancelled = 0;
        let placed = 0;
        let returned = 0;
        let returnRequested = 0;
        let returnDenied = 0;
        let pending = 0;
        orders.map((order) => {
            order.products.map((product) => {
                if (product.status == 'Delivered') {
                    delivered++
                } else if (product.status == 'Placed') {
                    placed++
                } else if (product.status == 'Cancelled') {
                    cancelled++
                } else if (product.status == 'Returned') {
                    returned++
                }
                else if (product.status == 'Return Requested') {
                    returnRequested++

                } else if (product.status == 'Pending') {
                    pending++

                } else if (product.status == 'Return Denied') {
                    returnDenied++
                }
            })
        });


        const latestOrders = await Orders.find({}).sort({ date: -1 }).populate('user').limit(limit).skip((page - 1) * limit).exec();
        const total = await Orders.aggregate([{ $match: { 'products.status': 'Delivered' } }, { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]);
        const totalRevenue = total.map((value) => value.totalRevenue)[0] || 0
        const orderCount = await Orders.find({}).count();
        const productCount = await Products.find({}).count();
        const categoryCount = await Category.find({}).count();
        const currentDate = new Date();
          const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
const monthly = await Orders.aggregate([{$match:{'products.status':'Delivered',date:{$gt:startOfMonth,$lt:endOfMonth}}},{$group:{_id:null,monthlyRevenue:{$sum:'$totalRevenue'}}}]);
const monthlyRevenue = monthly.map((value)=>value)[0]||0;
const users = await Users.find({verified:true}).count();


const currentMonthh = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const defaultMonthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: 0,
    count: 0
  }));

  monthlySalesData  = await Orders.aggregate([
    {$unwind:"$products"},
    {$match:{'products.status':"Delivered",
        status:{$ne:'Cancelled'},
        date:{$gte:new Date(currentYear,0,1)}
    }
},
{
    $group:{
        _id:{$month:'$date'},
        total:{$sum:"$totalAmount"},
        countt:{$sum:1}
    }
},
{
    $project:{
        _id:0,
        month:'$_id',
        total:'$total',
        count:'$countt'
    }
}
]);

const updatedMonthValue = defaultMonthly .map((defaultMonthly)=>{
    const foundMonth = monthlySalesData.find((monthData)=>{
return monthData == defaultMonthly
    })
})

        // console.log('toatal-----',total)//---------------
        // console.log('totalRevenue-----',totalRevenue)//---------------
        // console.log('orderCount-----',orderCount)//---------------
        // console.log('productCount-----',productCount)//---------------
        // console.log('categoryCount-----',categoryCount)//---------------
        // console.log('currentDate-----',currentDate)//---------------
        // console.log('startOfMonth-----',startOfMonth)//---------------
        // console.log('endOfMonth-----',endOfMonth)//---------------
        // console.log('monthly-----',monthly)//---------------
        // console.log('monthlyRevenue-----',monthlyRevenue)//---------------
        // console.log('users-----',users)//---------------

        res.render('dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }

}




//admin login
const adminLoginLoad = (req, res) => {
    try {
        res.render('aaadmin-login');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
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
                    email: email,
                    password: password
                }
                console.log('session from admin control', req.session.admin);//-----------------------------
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
        res.status(500).send("Internal Server Error");
    }
}

// admin logout
const loadLogout = (req, res) => {
    try {
        console.log('im in logout admin');//--------------------
        console.log('admin session a', req.session.admin);//----------
        req.session.admin = null;
        console.log('admin session b', req.session.admin);//-------------

        res.redirect('/admin')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }

}

// load customers
const customersLoad = async (req, res) => {
    try {

        let page = 1;
        let limit = 6;
        if (req.query.id) {
            page = req.query.id
        }
        let next = page + 1
        let previous = page > 1 ? page - 1 : 1
        let start = (page - 1) * limit
        console.log('start', start);//---------------------
        const count = await Users.find({}).count()

        let totalPage = Math.ceil(count / limit)
        if (next > totalPage) {
            next = totalPage
        }

        const userData = await Users.find({})
            .limit(limit)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .exec()
        // console.log(`userData = ${userData}`)//--------------------------------------------------------------------------------
        res.render("userManagement", {
            users: userData,
            page: page,
            previous: previous,
            next: next,
            totalPage: totalPage,
            start: start
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}



// block user
const blockUser = async (req, res) => {
    try {
        const id = await req.body.id;
        console.log(`id from block user ${id} `); //----------------------------------------------------------------------

        if (id) {
            const user = await Users.findOne({ _id: id });

            if (user) {
                if (user.isBlocked) {
                    await Users.updateOne({ _id: id }, { $set: { isBlocked: false } });
                    console.log(`user blocked `); //---------------------------------------------------------------
                    res.json({ block: true });

                } else {
                    await Users.updateOne({ _id: id }, { $set: { isBlocked: true } });
                    console.log(`user unblocked`); //---------------------------------------------------------------
                    res.json({ block: true });
                }
            }
        } else {
            console.log('id not getting in the block user');//------------------------------------------
            res.status(404).json({ error: 'user not loged' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred' });
    }
}


// ========================================================================== OFFER ========================================================


// load offers
const loadOffers = async (req, res) => {
    try {

        const totalOffer = await Offers.find({})
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 8;
        let next = page + 1;
        let previous = page > 1 ? page - 1 : 1;
        let count = totalOffer.length;

        let totalPage = Math.ceil(count / limit);
        if (next > totalPage) {
            next = totalPage
        }

        const offers = await Offers.find({}).limit(limit).sort({ createdAt: -1 });


        res.status(200).render('offers', {
            offers,
            totalPage,
            previous,
            next,
            page
        })

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}




// add offer 
const addOffer = (req, res) => {
    try {
        res.status(200).render('addOffer');

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}


// insert Offer
const insertOffer = async (req, res) => {
    try {
        console.log('within inset offer')//-------------------
        let { name, endDate, discount, isListed } = req.body;
        name = name.toLowerCase();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        console.log("name", name);//--------------

        const nameAlready = await Offers.findOne({ name: name });
        if (nameAlready) {
            res.json({ already: "This name already exists !" })
        } else {
            const offer = new Offers({
                name: name,
                discount: discount,
                endDate: endDate,
                isListed: isListed
            });

            await offer.save();

            console.log("offer saved");//----------------------
            res.status(200).json({ success: true });
        }



    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}



// edit offer
const editOffer = async (req, res) => {
    try {
        const offerId = req.query.id;
        console.log("offerId", offerId)//---------------------

        const offerDetails = await Offers.findOne({ _id: offerId });

        if (offerDetails) {
            console.log("within offerDEtail if")//-----------------------------
            res.status(200).render('editOffer', { offerDetails });
        } else {
            console.log("within offerDEtail else")//-----------------------------

            throw new Error("offer not found this offerId")
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");

    }
}



//update offer
const updateOffer = async (req, res) => {
    try {
        console.log("within updatre offer");//------------------
        console.log("within updatre body", req.body);//------------------
        let { name, endDate, discount, offerId } = req.body;
        name = name.toLowerCase();
        name = name.charAt(0).toUpperCase() + name.slice(1);

        const nameAlready = await Offers.findOne({ name: name, _id: { $ne: offerId } });

        if (nameAlready) {

            res.json({ already: "This name already exists !" });

        } else {

            const updatedOffer = await Offers.findByIdAndUpdate({
                _id: offerId
            }, {
                $set: {
                    name: name,
                    endDate: endDate,
                    discount: discount
                }
            }, {
                new: true
            })

            console.log("updatedOffer", updatedOffer)//-----------------
            res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}




function parseBoolean(value) {
    return Boolean(value === 'true')
}

// change offer status
const changeOfferStatus = async (req, res) => {
    console.log("changeOfferStatus invoked"); //-----------
    try {
        const { offerId, status } = req.body;


        // Convert status to boolean
        const currentStatus = parseBoolean(status)
        console.log('iam curr', currentStatus)//---------------------
        const toStatus = !currentStatus;

        console.log('changeOfferStatus'); //--------------------
        console.log('req.body', req.body); //--------------------
        console.log('status', currentStatus); //--------------------
        console.log('toStatus', toStatus); //--------------------

        const updatedOffer = await Offers.findByIdAndUpdate(
            { _id: offerId },
            { $set: { isListed: toStatus } },
            { new: true }
        );

        console.log("updatedOffer", updatedOffer); //-------------------

        if (updatedOffer) {
            console.log('ooooooooooooooooooooooooo', updatedOffer);//---------------
            res.json({ statusChanged: true });
        } else {
            res.json({ message: "Offer not found", statusChanged: false });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", statusChanged: false });
    }
}




// apply offer on product
const applyPoductOffer = async (req, res) => {
    try {
        console.log("with product apply offer");//---------
        console.log("req.bpdu", req.body)//-----------------
        const { productId, offerId } = req.body;

        console.log("productId",productId)//---------------------------
        console.log("offerId",offerId)//---------------------------

        const addOfferProduct = await Products.findByIdAndUpdate({
            _id: productId
        }, {
            $set: {
                appliedOffer: offerId
            }
        }, {
            new: true
        });

        const updateAppliedProduct = await Offers.findByIdAndUpdate({
            _id: offerId
        }, {
            $addToSet: {
                productId: productId
            }
        }, {
            new: true
        })

        console.log("addOfferProduct", addOfferProduct)//--------------
        console.log("updateAppliedProduct", updateAppliedProduct)//---------------------

        if (addOfferProduct) {
            console.log(" if addOfferProduct")//--------------

            if (updateAppliedProduct) {
                console.log(" if updateAppliedProduct")//--------------

                res.status(200).json({ success: true, message: "offer added successful!" });
            } else {
                console.log(" else updateAppliedProduct")//--------------

                res.status(400).json({ success: false, message: "offer Product Id not updated!" });
            }

        } else {
            console.log(" else addOfferProduct")//--------------

            res.status(400).json({ success: false, message: "product not found!" });
        }

    } catch (error) {
        console.log(error);

    }
}



// remove product offer
const removePoductOffer = async (req, res)=>{
    try {

        console.log("remove prodcut offer backend-----------------------,",req.body)//-----------------------
    const {productId,offerId}=req.body;
    console.log("producuctId",productId)//----------------------------
    console.log("offerId",offerId)//----------------------------

    console.log("typeOf(ProductId)",typeof(productId))//---------------------

    const removeProductOffer = await Products.findByIdAndUpdate(
        {_id:productId},
        {$unset:{appliedOffer:""}},
        {new:true}
    );

console.log('removeProductOffer',removeProductOffer)//--------------------------

const updatedOffer = await Offers.findByIdAndUpdate(
    {_id:offerId},
    {$pull:{productId:productId}}, 
    { new:true}
);

    console.log("updatedOffer1")//----------------------
    console.log("updatedOffer",updatedOffer)//----------------------
    console.log("updatedOffer2")//----------------------

    if(removeProductOffer){
        if(updatedOffer){
            res.status(200).json({removed:true,message:"Category offer succesfully removed"});

        }else{
            res.status(404).json({ removed: false, message: "Offer not found or failed to update" });
        }
    }else{
        res.status(404).json({ removed: false, message: "Product not found or failed to update" });
    }

  
    } catch (error) {
        console.log(error)
    }
}



// load category, product offers
const loadOfferForApply = async (req, res) => {
    try {
        console.log('within apply offer')//------------
let categoryId = null;
let productId=null
         categoryId= req.query.category;
         productId= req.query.product;

        let currentdate = Date.now();

        const totalOffer = await Offers.find({ isListed: true, endDate: { $gte: currentdate } });
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 8;
        let next = page + 1;
        let previous = page > 1 ? page - 1 : 1;
        let count = totalOffer.length;

        let totalPage = Math.ceil(count / limit);
        if (next > totalPage) {
            next = totalPage
        }

        const offers = await Offers.find({ isListed: true, endDate: { $gte: currentdate } }).limit(limit).sort({ createdAt: -1 });

        res.status(200).render('applyOffers', {
            offers,
            categoryId,
            productId,
            totalPage,
            previous,
            next,
            page
        })

    } catch (error) {
        console.log(error)
    }
}





// apply offer on product
const applyCategoryOffer = async (req, res) => {
    try {
        console.log("with product apply offer");//---------
        console.log("req.bpdu", req.body)//-----------------
        const { categoryId, offerId } = req.body;



        const addOfferCategory = await Category.findByIdAndUpdate({
            _id: categoryId
        }, {
            $set: {
                appliedOffer: offerId
            }
        }, {
            new: true
        });

        const updateAppliedCategory = await Offers.findByIdAndUpdate({
            _id: offerId
        }, {
            $addToSet: {
                appliedCategory: categoryId
            }
        }, {
            new: true
        })

        console.log("addOfferCategory", addOfferCategory)//--------------
        console.log("updateAppliedCategory", updateAppliedCategory)//---------------------

        if (addOfferCategory) {
            console.log(" if addOfferCategory")//--------------

            if (updateAppliedCategory) {
                console.log(" if updateAppliedCategory")//--------------

                res.status(200).json({ success: true, message: "offer added successful!" });
            } else {
                console.log(" else updateAppliedCategory")//--------------

                res.status(400).json({ success: false, message: "offer category id not updated!" });
            }

        } else {
            console.log(" else addOfferCategory")//--------------

            res.status(400).json({ success: false, message: "product not found!" });
        }

    } catch (error) {
        console.log(error);

    }
}



// remove offer on category
 const removecategoryOffer = async (req, res)=>{
    try {
        const {categoryId, offerId}=req.body;
        console.log("categoryId",categoryId)//--------------------------
        console.log("offerId",offerId)//--------------------------

        const offerRemovedCategory = await Category.findByIdAndUpdate(
            {_id:categoryId},
            {$unset:{appliedOffer:offerId}},
            {new:true}
        );
        
const updateOffer = await Offers.findByIdAndUpdate(
    {_id:offerId},
    {$pull:{appliedCategory:categoryId}},
    {new:true}
)

console.log("updateOffer",updateOffer)//--------------------------
console.log("offerRemovedCategory",offerRemovedCategory)//--------------------------

if(offerRemovedCategory){
    if(updateOffer){
        res.status(200).json({removed:true,message:"Offer successfully Removed"})
    }else{
        res.json({removed:false,message:"Offer not found or failed to update" });
    }
}else{
    res.json({removed:false,message:"Category not found or failed to update"});
}

    } catch (error) {
        console.log(error)
    }
 }

// ====================================================================  saleReport    =================================================


// load sales report

const loadSalesreport = async (req, res) => {
    try {
        console.log("within controller sales report")//--------------------
        let startDate = new Date(req.query?.start);
        let endDate = new Date(req.query?.end);
        // let status = "all"
    //    status = req?.query?.status;
    let dateRange = req.query?.date

    let currentDate= new Date();

        console.log("startDAte", startDate)//-----------------
        console.log("endDate", endDate)//-----------------
        // console.log("status", status)//-----------------
        console.log("currentDate", currentDate)//-----------------

        // Adjust endDate to include the entire end day by setting the time to the end of the day
        endDate.setHours(23, 59, 59, 999);

        console.log("endDate2222", endDate)//-----------------


        let filterConditons ={
          
                orderStatus: { $nin: ['Cancelled', 'Pending'] },   
        }

        if(startDate & startDate){
            filterConditons.date =  { $gte: startDate, $lte: endDate }
        }        

if(dateRange){

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();
    let day = currentDate.getDay();

    if(dateRange=="All"){
        const orders = await Orders.find(filterConditons).populate('user').populate('products.productId');
        console.log("orders.length",orders.length)//-------------------------
       return res.status(200).render("salesReport", { orders ,dateRange});
    }

    if(dateRange=="Day"){
        startDate= new Date(currentDate.setHours(0,0,0,0));
        endDate= new Date(currentDate.setHours(23, 59, 59, 999));

        console.log(`Day:${startDate}---------------------${endDate}`)//----------------------------
        filterConditons.date =  { $gte: startDate, $lte: endDate }
    }
 
    if(dateRange=="Week"){
        // startDate = new Date(year,month,day-(day+6)).setHours(0, 0, 0, 0);
        // endDate = new Date(year,month,day).setHours(23, 59, 59, 999);
startDate= new Date(year, month, currentDate.getDate() - day - 7);

endDate=currentDate.setDate(currentDate.getDate() - day - 1);


        console.log(`Week:${startDate}---------------------${endDate}`)//----------------------------
        filterConditons.date =  { $gte: startDate, $lte: endDate }
    }

    if(dateRange=="Month"){
        startDate=new Date(year,month,1).setHours(0,0,0,0);
        endDate=new Date(year,month,31).setHours(23, 59, 59, 999);   
          console.log(`Month:${startDate}---------------------${endDate}`)//----------------------------
          filterConditons.date =  { $gte: startDate, $lte: endDate }
    }

    if(dateRange=="Year"){
        startDate=new Date(year,0,1).setHours(0,0,0,0);
        endDate=new Date(year,11,31).setHours(23, 59, 59, 999);

        console.log(`Year:${startDate}---------------------${endDate}`)//----------------------------
        filterConditons.date =  { $gte: startDate, $lte: endDate }
    }

}


console.log("filterConditons=============",filterConditons)//--------------------
       

        // if(status && status!="all"){
        //     filterConditons["products.status"]=status;
        // }

        // const orders = await Orders.find({ date: { $gte: startDate, $lte: endDate }, "products.status": "Delivered" }).populate('user').populate('products.productId');
        const orders = await Orders.find(filterConditons).populate('user').populate('products.productId');
        // console.log("salesData", orders)//---------------
        console.log("orders.length",orders.length)//-------------------------
        res.status(200).render("salesReport", { orders ,dateRange});
    } catch (error) {
        console.log(error)
    }
}





module.exports = {
    adminLoginLoad,
    loadDashboard,
    verifyAdminLogin,
    customersLoad,
    blockUser,
    loadLogout,




    loadOffers,
    addOffer,
    insertOffer,
    editOffer,
    updateOffer,
    changeOfferStatus,


    // loadProductOffer,
    applyPoductOffer,
    removePoductOffer,


    loadOfferForApply,
    applyCategoryOffer,
    removecategoryOffer,


    loadSalesreport




}