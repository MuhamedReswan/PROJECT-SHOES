let data = {}
let cancelButtons = document.querySelectorAll('.cancel-order');
cancelButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        data.orderId = btn.getAttribute('data-orderId')
    })
})


function cancelOrders() {
    data.comment = document.getElementById('additionalComments').value;
    data.reason = document.getElementById('cancelReason').value;

    fetch(`/cancel-order`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)

    }).then((res) => {
        return res.json()
    }).then((response) => {
        if (response.orderCancel) {
            console.log('in orderCancel response')
            // $('#reloadList').load('/my-orders #r/eloadList')
            // window.location.href="/my-orders"
            Swal.fire({
                title: `Order Cancelled`,
                icon: "success",
                showConfirmationButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 200)

                    // $('#reloadList').load('/my-orders #r/eloadList')
                }
            });
        }
    })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}



let cancelConfirm = document.getElementById('cancel-confirm')

cancelConfirm.addEventListener('click', (e) => {
    let cancelModal = document.getElementById('customizedModal')
    cancelModal.setAttribute('style', 'diplay:none')
    //    cancelModal.classList.remove('show')
    cancelOrders()
});

let retryData = {}
let retryPaymentsButtons = document.querySelectorAll('.retry-payment')

retryPaymentsButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        console.log("retry button cliked")
        retryData.orderId = btn.getAttribute('data-orderId');

        axios.post('/my-orders/retry-payment', retryData)
            .then((response) => {

                if (response.data.success) {


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

                        console.log("razor failed", respon)
                        setTimeout(() => {
                            Swal.fire({
                                titleText: 'Payment Failed',
                                width: '300px',
                                padding: '10px',
                                icon: 'error',
                                showConfirmButton: false,
                                timer: 1500,
                            });

                        }, 1000)
                        handleRazorpayFailure(respon, response.data)

                    });

                    razorpayObject.open();

                }
                else {
                    setTimeout(() => {
                        Swal.fire({
                            titleText: 'Payment Failed',
                            width: '300px',
                            padding: '10px',
                            icon: 'error',
                            showConfirmButton: false,
                            timer: 1500,
                        }, 1000);

                    })
                }

            }).catch((error) => {
                console.log(error);
            })
    })
})



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
            console.log("data in razorpay failed resposnse", data)

            Swal.fire({
                titleText: 'Something went wrong',
                width: '300px',
                padding: '10px',
                icon: 'error',

                showConfirmButton: false,
                timer: 1500,
            }, 500);

            setTimeout(() => {
                // location.href = `/order-details?id=${data.orderDetails._id}`
                location.href = `/single-order-product?orderid=${data.orderDetails._id}`
            }, 1600);
        })
}



function verifyRazorpayPayment(payment, order) {

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
                location.href = `/order-success/${res.orderId}`
            } else {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Payment failed",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        })
}
