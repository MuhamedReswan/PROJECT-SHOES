function addAddressValidation() {
    // event.preventDefault(); // Prevent form submission if validation fails
    console.log('im add-address validation');
    // Get form fields
    const name = document.getElementById('input-firstname').value.trim();
    const mobile = document.getElementById('input-telephone').value.trim();
    const address = document.getElementById('input-address-1').value.trim();
    const district = document.getElementById('input-district').value.trim();
    const city = document.getElementById('input-city').value.trim();
    const pincode = document.getElementById('input-postcode').value.trim();

    // Regular expressions for validation
    const nameRegex = /^[^\s].+/;
    const mobileRegex = /^\d{10}$/;
    const textRegex = /^[^\d]+$/;
    const pincodeRegex = /^\d{6}$/;

    // Error messages
    const errors = [];

    // Validate each field
    if (!nameRegex.test(name) || name == '') {
        errors.push('Please enter a proper name');
        document.getElementById('input-firstname').classList.add('error');
        displayErrors(errors);
        return false;
    }

    if (!mobileRegex.test(mobile) || mobile.length > 10 || mobile.length < 10) {
        errors.push('Mobile number should be 10 digits.');
        document.getElementById('input-telephone').classList.add('error');
        displayErrors(errors);
        return false;
    }

    if (!textRegex.test(address) || address == '') {
        errors.push('Please enter a valid address');
        document.getElementById('input-address-1').classList.add('error');
        displayErrors(errors);
        return false;
    }

    if (!textRegex.test(district) || district == '') {
        errors.push('Please enter a valid distric name.');
        document.getElementById('input-district').classList.add('error');
        displayErrors(errors);
        return false;
    }

    if (!textRegex.test(city) || city == '') {
        errors.push('Please enter a valid city name.');
        document.getElementById('input-city').classList.add('error');
        displayErrors(errors);
        return false;
    }

    if (!pincodeRegex.test(pincode) || pincode == '') {
        errors.push('Pincode should be 6 digits.');
        document.getElementById('input-postcode').classList.add('error');
        displayErrors(errors);
        return false;
    }

    // If all validations pass, return true
    console.log('return true');
    return true;
}

function displayErrors(errors) {
    // Display error messages
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = errors.map(error => `<strong><p class="text-danger">${error}</p></strong>`).join('');
    errorContainer.style.display = 'block';
    setTimeout(() => {
        errorContainer.innerHTML = ""
    }, 3000)
}

// Remove error class on input focus
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        input.classList.remove('error');
        document.getElementById('error-container').style.display = '';
    });
});






function checkoutValidation(event) {

    console.log('im addres payment validation');//-----------------
    const addressRadios = document.getElementsByName('selectedAddress');
    const paymentError = document.getElementById('paymentError');
    const addressError = document.getElementById('addressError');
    const paymentOption = document.getElementsByName('paymentOption');


    let addressSelected = false;
    for (let i = 0; i < addressRadios.length; i++) {
        if (addressRadios[i].checked) {
            addressSelected = true;
            break;
        }
    }

    let paymentSelected = false;
    for (let i = 0; i < paymentOption.length; i++) {
        if (paymentOption[i].checked) {
            paymentSelected = true;
        }
    }

    if (!addressSelected) {
        Swal.fire({
            icon: 'warning',
            text: " please Select Delivery Address !",
            showConfirmButton: false,
            width: '300px',
            showConfirmButton: '#d33'
        })
        return false;

    } else if (!paymentSelected) {
        Swal.fire({
            icon: 'warning',
            text: "Please Select Payment Method !",
            showConfirmButton: false,
            width: '300px',
            showConfirmButton: '#d33'
        })
        return false;

    } else {
        const radioButtonAddress = document.querySelector('input[name="selectedAddress"]:checked');
        const index = radioButtonAddress ? radioButtonAddress.value : null
        if (index) {
            const radioButtonPayment = document.querySelector('input[name="paymentOption"]:checked');
            const paymentMethod = radioButtonPayment ? radioButtonPayment.value : null;
            console.log('paymentMethod', paymentMethod)
            if (paymentMethod) {
                const subtotal = document.getElementById('sub-total').getAttribute('data-subtotal');
                console.log('data-sudtotal' + subtotal)
                if (subtotal) {
                    let data = { index: index, subtotal: subtotal, paymentMethod: paymentMethod }

                    fetch('/place-order', {
                        method: 'Post',
                        headers: {
                            'content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                        .then(Response => Response.json())
                        .then((res) => {
                            console.log(res, 'res /place-order front')
                            if (res.cartProduct == false) {

                                Swal.fire({
                                    icon: 'warning !',
                                    text: `Sorry your cart is empty.`,
                                    width: '300px',
                                    showConfirmButton: '#d33'
                                });
                                setTimeout(() => {
                                    window.location.href = "/cart"
                                }, 1500)

                            }
                            if (res.notListedProduct) {
                                Swal.fire({
                                    icon: 'warning',
                                    text: `Sorry your product ${res.unListedProduct} Currently Un Available'`,
                                    width: '300px',
                                    showConfirmButton: '#d33'
                                });
                            }

                            if (res.quant) {
                                Swal.fire({
                                    icon: 'warning',
                                    text: `Sorry your product ${res.lessQuantity} is Out Of Stock'`,
                                    width: '300px',
                                    showConfirmButton: '#d33'
                                });
                            }
                            if (res.paymentMethod == 'COD') {
                                location.href = `/order-success/${res.orderId}`

                            } else if (res.paymentMethod == 'Online') {
                                if (res.success) {
                                    console.log("ccontact", res);//----------


                                    let options = {
                                        "key": "" + res.key_id + "", // Enter the Key ID generated from the Dashboard
                                        "amount": res.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                                        "currency": "INR",
                                        "name": "ShoeFactory", //your business name
                                        "description": "Test Transaction",
                                        "image": "https://dummyimage.com//600x400/000/fff",
                                        "order_id": res.order_id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                                        handler: (response) => {

                                            console.log("payment success", response);//---------------------
                                            verifyRazorpayPayment(response, res);
                                        },
                                        "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
                                            "name": "" + res.name + "", //your customer's name
                                            "email": "" + res.email + "",
                                            "contact": "" + res.contact + "" //Provide the customer's phone number for better conversion rates 
                                        },
                                        "notes": {
                                            "description": "" + "It is a test transaction"
                                        },
                                        "theme": {
                                            "color": "#4c5d50"
                                        }
                                    };


                                    let razorpayObject = new Razorpay(options);
                                    razorpayObject.on('payment.failed', function (response) {

                                        console.log("annna");///-----------------------
                                        console.log("razor failed++++++", response)//----------------------
                                        alert("Payment failed");
                                        handleRazorpayFailure(response, res)

                                    });

                                    razorpayObject.open();

                                }
                                else {
                                    console.log('im in else alert')
                                    alert(res.msg);
                                }

                            } else if (res.paymentMethod == 'Wallet') {
                                let subtotal;
                                let index;
                                if (res.walletBalance) {

                                    Swal.fire({
                                        icon: 'success',
                                        text: `Wallet payment succes`,
                                        width: '300px',
                                        showConfirmButton: '#d33'
                                    });

                                    subtotal = res.subtotal
                                    index = res.index

                                    setTimeout(() => {
                                        location.href = `/order-success/${res.orderId}`
                                    }, 1500)



                                } else {
                                    if (!res.empty) {


                                        Swal.fire({
                                            icon: 'warning',
                                            text: `${res.message}`,
                                            width: '300px',
                                            showConfirmButton: true,
                                            showCancelButton: true,
                                            confirmButtonText: "Pay with online!",
                                            cancelButtonText: "No!",
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                // User clicked the "Pay with online!" button
                                                console.log('User confirmed:-------------------', result);
                                                data.paymentMethod = "Wallet With Online";
                                               

                                                console.log("data", data)//------------------------
console.log("wallet payment with online bwforeth,",data)//-----------------------------

                                                axios.post('/place-order', data)
                                                    .then((response) => {
                                                        response.data.success
                                                        if (response.data.success) {
                                                            console.log("withi axios response", response)//--------------------------------

                                                            if (response.data.success) {
                                                                console.log("ccontact", res);//----------


                                                                let options = {
                                                                    "key": "" + response.data.key_id + "", // Enter the Key ID generated from the Dashboard
                                                                    "amount": response.data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                                                                    "currency": "INR",
                                                                    "name": "ShoeFactory", //your business name
                                                                    "description": "Test Transaction",
                                                                    "image": "https://dummyimage.com//600x400/000/fff",
                                                                    "order_id": response.data.order_id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                                                                    handler: (respon) => {

                                                                        console.log("payment success", respon);//---------------------
                                                                        verifyRazorpayPayment(respon, response.data);
                                                                    },
                                                                    "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
                                                                        "name": "" + response.data.name + "", //your customer's name
                                                                        "email": "" + response.data.email + "",
                                                                        "contact": "" + response.data.contact + "" //Provide the customer's phone number for better conversion rates 
                                                                    },
                                                                    "notes": {
                                                                        "description": "" + "It is a test transaction"
                                                                    },
                                                                    "theme": {
                                                                        "color": "#4c5d50"
                                                                    }
                                                                };


                                                                let razorpayObject = new Razorpay(options);
                                                                razorpayObject.on('payment.failed', function (respon) {

                                                                    console.log("annna");///-----------------------
                                                                    console.log("razor failed++++++", respon)//----------------------
                                                                    alert("Payment failed");
                                                                    handleRazorpayFailure(respon, response.data)

                                                                });

                                                                razorpayObject.open();

                                                            }
                                                            else {
                                                                console.log('im in else alert')//---------------------------
                                                                alert(res.msg);
                                                            }

                                                        }
                                                    }).catch((error) => {
                                                        console.log("axios error place order", error)
                                                    })

                                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                console.log('User cancelled:', result);
                                            }
                                        });
                                    } else {
                                        Swal.fire({
                                            icon: 'error',
                                            text: `${res.message}`, width: '300px',
                                            showConfirmButton: '#d33'
                                        });
                                    }
                                }

                            }
                        })
                        .catch(error => console.log(error))


                }

            }
        }


    }

}



function handleRazorpayFailure(response, data) {

    console.log("response PaymentFailed orderId", response)
    let orderId = data.orderId

    fetch("/order/razorpay-failed", {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
    })
        .then((response) => response.json())
        .then((data) => {

            Swal.fire({
                titleText: 'Something went wrong',
                width: '300px',
                padding: '10px',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500,
            });
            setTimeout(() => {
                Swal.fire({
                    titleText: 'Payment Failed',
                    width: '300px',
                    padding: '10px',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                });
            }, 500);

            setTimeout(() => {
                location.href = `/single-order-product?orderid=${data.orderDetails._id}`
            }, 1600);
        })
}



function verifyRazorpayPayment(payment, order) {
    console.log("within verifyRazorpayPayment in ejs")

    let data = { payment, order }

    fetch("/order/verify-payment", {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then((res) => res.json())
        .then((res) => {

            if (res.paymentSuccess) {

                console.log("payment verification successs in verifyRazorpayPayment")
                location.href = `/order-success/${res.orderId}`
            } else {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Payment failed",
                    showConfirmButton: false,
                    timer: 1000,
                });
            }
        })
}

const applyCouponButton = document.getElementById('apply-coupon');

applyCouponButton.addEventListener('click', applyCoupon);

applyCouponButton.addEventListener('click', applyCoupon);

const subTotalElement = document.getElementById('sub-total');
let subTotalValue = subTotalElement.dataset.subtotal;
subTotalValue = Math.round(subTotalValue);
console.log("subTotalValue", subTotalValue)//------------
const cartId = document.getElementById('order').getAttribute('cartId')

function applyCoupon() {

    const regex = /^[A-Za-z]{1,4}-[A-Za-z0-9]{6}-\d{1,2}$/;
    let couponCode = document.getElementById('coupon-code').value

    if (!regex.test(couponCode)) {
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Please enter a valid coupon code",
            showConfirmButton: false,
            width: "300px",
            timer: 1500,
        });
    } else {
        let data = {
            couponCode,
            cartId: cartId,
            subTotal: subTotalValue
        }

        fetch('/apply-coupon', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((response) => {

                if (response.valid) {


                    let placeOrderButton = document.getElementById('place-order').setAttribute('coupon-code', couponCode);

                    $('#page-content').load(`/checkout?subtotal=${subTotalValue} #page-content`, null, function () {

                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: `${response.message}`,
                            showConfirmButton: false,
                            width: "300px",
                            timer: 1500,
                        });

                        attachListernerApplyCoupon()

                    })
                }
                if (!response.valid) {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: `${response.message}`,
                        showConfirmButton: false,
                        width: "300px",
                        timer: 1500,
                    });
                }

            })
    }

}


document.body.addEventListener('click', function (event) {
    if (event.target.id === 'coupon-remove-button') {
        removeCoupon(); // Assuming removeCoupon is defined
    }
});


function removeCoupon() {
    let data = {
        cartId: cartId,
        subTotal: subTotalValue,
    }
    console.log('remove coupon invoked')//------------------------

    fetch('/remove-coupon', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then((res) => res.json())
        .then((response) => {
            if (response.removed) {

                let placeOrderButton = document.getElementById('place-order').setAttribute('coupon-code', "");


                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: `${response.message}`,
                    showConfirmButton: false,
                    width: "300px",
                    timer: 1500,
                });

                setTimeout(() => {
                    window.location.href = `/checkout?subtotal=${subTotalValue}`
                }, 1500)

            }
        })
}



// Assuming the table has an ID or a class for easy selection
let table = document.querySelector('#myTable'); // Change '#myTable' to the actual ID or class of your table

table.addEventListener('click', function (event) {
    let target = event.target;
    if (target.classList.contains('coupon-code')) {
        // Prevent the default action to avoid any unwanted behavior
        event.preventDefault();

        var couponCode = target.innerText.trim();
        // Copy the coupon code to the clipboard
        navigator.clipboard.writeText(couponCode)
            .then(() => {
                // alert('Coupon code copied to clipboard!');
                Swal.fire({
                    icon: "success",
                    text: "Code copied.",
                    width: "300px",
                    timer: 1000,
                });
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy coupon code. Please try again.');
            });
    }
});