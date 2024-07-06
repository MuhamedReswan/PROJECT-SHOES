require('dotenv').config();
const Users = require('../model/userModel');
const Products = require('../model/productsModel');
const Offers = require('../model/offerModel');


//load dashboard
const loadDashboard = (req, res) => {
    try {
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

        const offers = await Offers.find({}).limit(limit).sort({createdAt:-1});


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
        name = name.charAt(0).toUpperCase() + name.slice(1);

        const nameAlready = await Offers.findOne({ name: name,_id:{$ne:offerId} });

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




function parseBoolean(value){
    return Boolean(value === 'true')
}

// change offer status
const changeOfferStatus = async (req, res) => {
    console.log("changeOfferStatus invoked"); //-----------
    try {
        const { offerId, status } = req.body;
        

        // Convert status to boolean
        const currentStatus = parseBoolean(status)
        console.log('iam curr',currentStatus)//---------------------
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
            console.log('ooooooooooooooooooooooooo',updatedOffer);//---------------
            res.json({ statusChanged: true });
        } else {
            res.json({ message: "Offer not found", statusChanged: false });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", statusChanged: false });
    }
}



// apply offer
const applyOffer = async (req, res)=>{
try {
    console.log('within apply offer')//------------

    const productId = req.query.id;
let currentdate = Date.now()
//     const offers = await Offers.find({isListed:true,endDate:{$gte:currentdate} });
//     console.log("offers",offers)//---------------------

//  res.status(200).render("applyOffers",{offers});





 const totalOffer = await Offers.find({isListed:true,endDate:{$gte:currentdate} });
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

 const offers = await Offers.find({isListed:true,endDate:{$gte:currentdate} }).limit(limit).sort({createdAt:-1});


 res.status(200).render('applyOffers', {
     offers,
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
const applyPoductOffer = async (req,res)=>{
try {
console.log("with product apply offer");//---------
console.log("req.bpdu",req.body)//-----------------
    const {productId,offerId}=req.body;



    const addOfferProduct = await Products.findByIdAndUpdate({
        _id:productId
    },{
        $set:{
            appliedOffer:offerId
        }
    },{
        new:true
    });

    const updateAppliedProduct = await Offers.findByIdAndUpdate({
        _id:offerId
    },{
        $addToSet:{
            productId:productId
        }
    },{
        new:true
    })

    console.log("addOfferProduct",addOfferProduct)//--------------
console.log("updateAppliedProduct",updateAppliedProduct)//---------------------

if(addOfferProduct){
    console.log(" if addOfferProduct")//--------------

    if(updateAppliedProduct){
console.log(" if updateAppliedProduct")//--------------

        res.status(200).json({success:true, message:"offer added successful!"});
    }else{
        console.log(" else updateAppliedProduct")//--------------

        res.status(400).json({success:false, message:"offer Product Id not updated!" });
    }
   
}else{
    console.log(" else addOfferProduct")//--------------

    res.status(400).json({success:false, message:"product not found!" });
}
    
} catch (error) {
    console.log(error);
    
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


    applyOffer,
    applyPoductOffer




}