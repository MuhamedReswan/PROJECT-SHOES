$(document).ready(function () {
    $('#add-coupon').on('click', function () {
        $('#add-coupon-modal').modal('show');
    });
});

$(document).ready(function () {
    $('.close-modal').on('click', function () {
        $('#add-coupon-modal').modal('hide');
    });
});

$(document).ready(function () {
    $('#edit-coupon').on('click', function () {
        $('#edit-coupon-modal').modal('show');
    });
});

$(document).ready(function () {
    $('.close-modal').on('click', function () {
        $('#edit-coupon-modal').modal('hide');
    });
});


let couponName = document.getElementById('name');
let expireDate = document.getElementById('end-date');
let discountAmount = document.getElementById('discount-amount');
let userLimit = document.getElementById('user-limit');
const nameRegex = /^[a-zA-Z0-9\s]{4,30}$/
const descriptionRegex = /^[a-zA-Z\s]{15,}$/
let dateError = document.getElementById('date-error');
let nameError = document.getElementById('name-error');
let descriptionError = document.getElementById('description-error');
let discountAmountError = document.getElementById('discount-amount-error');
let minimumAmountError = document.getElementById('minimum-amount-error');
let userLimitError = document.getElementById('user-limit-error');
let commonError = document.getElementById('common-error');
let description = document.getElementById('description')
let minimumAmount = document.getElementById('minimum-amount')
let message;

function addCouponValidation() {
    let isValid = true;

    // Validate end date
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to 00:00:00

    let endDateObj = new Date(expireDate.value);
    endDateObj.setHours(0, 0, 0, 0); // Normalize time to 00:00:00

    if (couponName.value.trim() === '' || expireDate.value.trim() === '' || discountAmount.value.trim() === '' || description.value.trim() === '' || userLimit.value.trim() === '') {
        message = "Please fill all fields."
        showError(null, commonError, message);
        isValid = false;
    }

    else if (!nameRegex.test(couponName.value) || couponName.value.trim() === '') {
        message = "'Invalid coupon name. Please use only alphanumeric characters, hyphens (-), underscores (_), and keep the name between 4- 30 characters.'";
        showError(couponName, nameError, message);
        isValid = false;
    }

    // Validate discount amount
    else if (discountAmount.value <= 0 || discountAmount.value >= 90 || discountAmount.value.trim() == "") {
        message = "'Discount percentage must be greater between 0-90 %.'";
        showError(discountAmount, discountAmountError, message);
        isValid = false;
    }

    // Validate minimum amount
    else if (minimumAmount.value <= 0 || minimumAmount.value.trim() == "") {
        message = "Minimum amount should be greater than 0";
        showError(minimumAmount, minimumAmountError, message);
        isValid = false;
    }

    // Validate user limit
    else if (userLimit.value < 0) {
        message = "'User limit must be a non-negative number.'";
        showError(userLimit, userLimitError, message);
        isValid = false;
    }

    else if (!descriptionRegex.test(description.value) || description.value.trim() == "") {
        message = "Descritption should be atleast 15 character, dont include symbols or numbers !";
        showError(description, descriptionError, message);
        isValid = false;
    }


    else if (isNaN(endDateObj.getTime()) || endDateObj <= today) {
        message = "'Please enter a valid future date.'";
        showError(expireDate, dateError, message);
        isValid = false;
    }

    return isValid;
}

function showError(inputId, errorId, message) {
    if (inputId != null) {
        inputId.style.border = "1px solid red";
        errorId.style.fontSize = "14px";
    }
    errorId.style.fontSize = "14px";
    errorId.style.color = "red";
    errorId.innerText = `${message}`;



    setTimeout(() => {
        if (inputId != null) {
            inputId.style.border = "";
        } errorId.innerText = "";

    }, 3000);
}


let ecouponName = document.getElementById('e-name');
let eexpireDate = document.getElementById('e-end-date');
let ediscountAmount = document.getElementById('e-discount-amount');
let euserLimit = document.getElementById('e-user-limit');
const enameRegex = /^[a-zA-Z0-9\s]{4,30}$/
const edescriptionRegex = /^[a-zA-Z\s]{15,}$/
let edateError = document.getElementById('e-date-error');
let enameError = document.getElementById('e-name-error');
let edescriptionError = document.getElementById('e-description-error');
let ediscountAmountError = document.getElementById('e-discount-amount-error');
let eminimumAmountError = document.getElementById('e-minimum-amount-error');
let euserLimitError = document.getElementById('e-user-limit-error');
let ecommonError = document.getElementById('e-common-error');
let edescription = document.getElementById('e-description')
let eminimumAmount = document.getElementById('e-minimum-amount')
let emessage = "";

function editCouponValidation(e) {
    e.preventDefault()
    console.log("within edit validation");

    let isValid = true;

    // Validate end date
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to 00:00:00

    let endDateObj = new Date(eexpireDate.value);
    endDateObj.setHours(0, 0, 0, 0); // Normalize time to 00:00:00

    if (ecouponName.value.trim() === '' || eexpireDate.value.trim() === '' || ediscountAmount.value.trim() === '' || edescription.value.trim() === '' || euserLimit.value.trim() === '') {
        emessage = "Please fill all fields."
        showError(null, ecommonError, emessage);
        isValid = false;
    }

    else if (!enameRegex.test(ecouponName.value) || ecouponName.value.trim() === '') {
        emessage = "'Invalid coupon name. Please use only alphanumeric characters, hyphens (-), underscores (_), and keep the name between 4- 30 characters.'";
        showError(ecouponName, enameError, emessage);
        isValid = false;
    }

    // Validate discount amount
    else if (ediscountAmount.value <= 0 || ediscountAmount.value >= 90 || ediscountAmount.value.trim() == "") {
        emessage = "'Discount percentage must be greater between 0-90 %.'";
        showError(ediscountAmount, ediscountAmountError, emessage);
        isValid = false;
    }

    // Validate minimum amount
    else if (eminimumAmount.value <= 0 || eminimumAmount.value.trim() == "") {
        emessage = "Minimum amount should be greater than 0";
        showError(eminimumAmount, eminimumAmountError, emessage);
        isValid = false;
    }

    // Validate user limit
    else if (euserLimit.value < 0) {
        emessage = "'User limit must be a non-negative number.'";
        showError(euserLimit, euserLimitError, emessage);
        isValid = false;
    }

    else if (!edescriptionRegex.test(edescription.value) || edescription.value.trim() == "") {
        emessage = "Descritption should be atleast 15 character, dont include symbols or numbers !";
        showError(edescription, edescriptionError, emessage);
        isValid = false;
    }


    else if (isNaN(endDateObj.getTime()) || endDateObj < today) {
        emessage = "'Please enter a valid future date.'";
        showError(eexpireDate, edateError, emessage);
        isValid = false;
    }

    console.log('EDIT VALIDATION TRUE')//------------------;
    return isValid;
}




$(document).ready(function () {
    $('#edit-coupon-form').on('submit', function (e) {
        console.log("within edit submission");
        e.preventDefault();
        let isValid = editCouponValidation(e);
        if (isValid) {


            let formData = $(this).serialize()

            console.log("Formdata", formData)//---------------

            $.ajax({
                url: '/admin/coupons/edit-coupon',
                type: 'POST',
                data: formData,
                success: function (response) {

                    console.log('response', response)
                    if (response.success) {

                        Swal.fire({
                            title: "updated!",
                            text: "coupon successfully updated !",
                            icon: "success",
                            width: "300px",
                            // timer: 1000
                        });

                        setTimeout(() => {
                            window.location.href = "/admin/coupons"
                        }, 1600)
                    }
                    if (response.already) {
                        Swal.fire({
                            title: "already exist !",
                            text: "coupon name already exist!",
                            icon: "error",
                            width: "300px",
                            // timer: 1000
                        });
                    }
                },
                error: ((error) => {
                    console.log(error)
                })
            });
        }
    })
})


$(document).ready(function () {
    $('#add-coupon-form').on('submit', function (e) {
        console.log("within edit submission");
        e.preventDefault();
        let isValid = addCouponValidation(e);
        if (isValid) {
            let formData = $(this).serialize()

            console.log("Formdata", formData)//---------------

            $.ajax({
                url: '/admin/coupons/add-coupon',
                type: 'POST',
                data: formData,
                success: function (response) {

                    console.log('response', response)

                    if (response.already) {
                        let errorMessage = "coupon name already exists !"

                        Swal.fire({
                            title: "already exist !",
                            text: "coupon name already exist!",
                            icon: "error",
                            width: "300px",
                            timer: 1000
                        });

                    }
                    if (response.success) {

                        Swal.fire({
                            title: "Created!",
                            text: "coupon successfully Creted !",
                            icon: "success",
                            width: "300px",
                            timer: 1000
                        });


                        setTimeout(() => {
                            window.location.href = "/admin/coupons"
                        }, 1600)
                    }



                },
                error: ((error) => {
                    console.log(error)
                })
            });
        }
    })
})


$(document).ready(function () {
    $('body').on('click', '.btn-outline-dark', function () {
        var $this = $(this);
        console.log("$this", $this)//----------------
        var title = $this.data('title');
        var couponCode = $this.data('couponcode');
        var description = $this.data('description');
        var minCost = $this.data('mincost');
        var discount = $this.data('discount');
        var limit = $this.data('limit');
        var isListed = $this.data('islisted');
        var expiryDate = $this.data('expirydate');
        let couponId = $this.data('id')
        console.log("$couponId", couponId)//----------------
        console.log("$expiryDate", expiryDate)//----------------



        // Populate the modal form fields
        $('#e-name').val(title);
        $('#e-couponcode').val(couponCode);
        $('#e-description').val(description);
        $('#e-minimum-amount').val(minCost);
        $('#e-discount-amount').val(discount);
        $('#e-user-limit').val(limit);
        $('#e-coupon-id').val(couponId);


        let date = new Date(expiryDate);
        let month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
        let day = date.getDate().toString().padStart(2, '0'); // getDay() returns the day of the week
        let year = date.getFullYear();
        let formattedDate = `${year}-${month}-${day}`;
        console.log(formattedDate, 'formattedDate');
        $('#e-end-date').val(formattedDate);

        // Show the modal
        $('#edit-coupon-modal').modal('show');
    });
});

function changeStatus(couponId, status) {
    console.log("coupon id --", couponId)//------------
    console.log("status id --", status)//------------

    swal.fire({
        title: "Are you sure?",
        text: `Do you want List / Unlist  this user !`,
        icon: "question",
        width: "300px",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!"

    }).then((result) => {
console.log("is result",result)//---------------
        if (result.isConfirmed) {
            console.log("is confirmed")//---------------
let data ={ couponId, status }

            fetch('/admin/coupons/change-status', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then((res) => res.json())
                .then((response) => {
                    if (response.changed) {
                        console.log("withis response chanfed");//--------------
                        Swal.fire({
                            title: "Changed",
                            text: "status successfully changed !",
                            icon: "success",
                            width: "300px",
                            timer:1000
                        });
                    }
                    if (!response.changed) {
                        Swal.fire({
                            title: "failed !",
                            text: "some error occured",
                            icon: "error",
                            width: "300px",
                            timer:1000
                        });
                    }

                    setTimeout(() => {
                            window.location.href = "/admin/coupons"
                        }, 1600)
                })
        }
    })

}
