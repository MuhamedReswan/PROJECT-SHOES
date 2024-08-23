
function changeProfile() {
    event.preventDefault();
    console.log('im in function');//---------

    let name = document.querySelector('input[name="name"]').value;
    let mobile = document.querySelector('input[name="mobile"]').value;
    let nameError = document.getElementById('nameError');
    let mobileError = document.getElementById('mobileError');


    // Clear previous error messages
    nameError.textContent = '';
    mobileError.textContent = '';

    // Validate name
    if (!/^\w+$/.test(name)) {
        nameError.textContent = 'Name must contain only letters and numbers.';
    } else if (mobile.trim().length !== 10 || !/^\d+$/.test(mobile)) {
        mobileError.textContent = 'Please enter a valid 10-digit mobile number.';
    } else {
        console.log('im here success')//----------------------
        let data = { name, mobile }
        fetch('/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(Response => Response.json())
            .then((res) => {
                if (res.nameAlready) {
                    swal.fire({
                        title: `User name already exist`,
                        icon: "warning",
                        showConfirmationButton: false,
                        timer: 1000,
                       
                    })
                }
                if (res.updated) {
                    swal.fire({
                        title: `Profile updated`,
                        icon: "success",
                        showConfirmationButton: false,
                        timer: 1000,
                        width: '300px',
                    })

                }
            })
    }
}

let table = document.getElementById('history-table');
let historyButton = document.getElementById('transaction-button');
let buttonText = document.getElementById('button-text');
function showHistory() {
    console.log("showHistoy")//--------------------
    table.style.display = "block"
    historyButton.setAttribute('onClick', 'hideHistory()');
    buttonText.innerText = "Hide history"

}

function hideHistory() {
    console.log("hide Histoy")//--------------------

    table.style.display = "none"
    historyButton.setAttribute('onClick', 'showHistory()');
    buttonText.innerText = "Show history"

}


function validatePassword() {
    console.log("im in validatePassword")
    let oldPasswordError = document.getElementById('old-Password-error')
    let newPasswordError = document.getElementById('new-Password-error')
    let confirmPasswordError = document.getElementById('confirm-Password-error');

    let oldPassword = document.getElementById('old-Password')
    let newPassword = document.getElementById('new-Password')
    let confirmPassword = document.getElementById('confirm-Password')
    console.log("old", oldPassword.value)
    console.log("new", newPassword.value)

    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,}$/
    // /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/

    function setError(errorId, inputId, message) {
        errorId.innerText = `${message}`
        inputId.style.border = 'solid 1px red';

        setTimeout(() => {
            errorId.innerText = ""
            inputId.style.border = '';
        }, 3000)
    }

    let message;

    if (oldPassword.value.trim() == "" || oldPassword.value.length < 4) {
        message = "please enter a valid password !"
        setError(oldPasswordError, oldPassword, message)
        return
    }

    else if (!passwordRegex.test(newPassword.value)) {

        message = "Password must be atleast 6 charcaters !"
        setError(newPasswordError, newPassword, message)
        return
    }

    else if (newPassword.value != confirmPassword.value) {
        message = "confirm password should be same !"
        setError(confirmPasswordError, confirmPassword, message)
        return
    }


    let data = {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
    }

    fetch('/profile/change-password', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((res) => res.json())
        .then((response) => {
            if (response.success) {

                swal.fire({
                    text: "password successfully updated",
                    icon: "success",
                    width: "300px",
                    showConfirmationButton: false,
                    timer: 1000
                })

                setTimeout(() => {
                    window.location.href = '/logout'

                }, 1500)

            } else {

                message = "in correct password !"
                setError(oldPasswordError, oldPassword, message)
                swal.fire({
                    text: "incorrect Password",
                    icon: "error",
                    width: "300px",
                    showConfirmationButton: false,
                    timer: 2000
                })
            }
        })
}


function copyToClipboard() {
    var inputField = document.getElementById('referralLink');
    navigator.clipboard.writeText(inputField.value).then(function () {
        swal.fire({
            text: "Referel code copied !",
            icon: "success",
            width: "300px",
            showConfirmationButton: false,
            timer: 2000
        })


    }).catch(function (err) {
        alert('Failed to copy text: ', err);
    });
}

