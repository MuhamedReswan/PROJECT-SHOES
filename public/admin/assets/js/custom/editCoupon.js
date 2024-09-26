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
