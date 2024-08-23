function validateForm(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    var email = document.getElementById("CustomerEmail").value.trim();
    var password = document.getElementById("CustomerPassword").value.trim();
    var emailErrorMessage = document.getElementById("emailErrorMessage");
    var passwordErrorMessage = document.getElementById("passwordErrorMessage");

    if (email === "") {
        emailErrorMessage.style.display = "block";
        passwordErrorMessage.style.display = "none";
        setTimeout(function () {
            emailErrorMessage.style.display = "none";
        }, 3000); // Hide after 3 seconds
    } else if (password === "") {
        passwordErrorMessage.style.display = "block";
        emailErrorMessage.style.display = "none";
        setTimeout(function () {
            passwordErrorMessage.style.display = "none";
        }, 3000); 
    } else {
        // Both fields are filled, proceed with form submission or other actions
        emailErrorMessage.style.display = "none";
        passwordErrorMessage.style.display = "none";

        console.log("Form would be submitted.");
        document.getElementById("CustomerLoginForm").submit();
    }
}

document.getElementById("CustomerLoginForm").onsubmit = validateForm;

