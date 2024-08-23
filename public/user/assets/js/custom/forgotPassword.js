function emailValidation() {
    const emailInput = document.getElementById('forgot-email');
    const errorMessage = document.getElementById('emailErrorMessage');
    errorMessage.style.display = 'none';
    emailInput.style.borderColor = '#ccc';
    const email = emailInput.value.trim();

    if (!email) {
        errorMessage.textContent = 'Please enter your email address.';
        errorMessage.style.display = 'block';
        emailInput.style.borderColor = 'red';
        removeErrorMessageAfterDelay(errorMessage, 3000);
        return false;
    }


    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address.';
        errorMessage.style.display = 'block';
        emailInput.style.borderColor = 'red';
        removeErrorMessageAfterDelay(errorMessage, 3000);
        return false;
    }

    return true;
}

function removeErrorMessageAfterDelay(errorMessage, delay) {
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, delay);
}