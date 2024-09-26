function showError(inputId, errorId, message) {
    if (inputId != null) {
        inputId.style.border = "1px solid red";
        errorId.style.fontSize = "6px";
    }
    errorId.style.fontSize = "14px";
    errorId.style.color = "red";
    errorId.innerText = `${message}`;

    setTimeout(() => {
        if (inputId != null) {
            inputId.style.border = "";
        }
        errorId.innerText = "";
    }, 3000);
}

document.getElementById('validateBtn').addEventListener('click', function () {
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    const currentDate = new Date().toISOString().split('T')[0]; // current date in YYYY-MM-DD format
    const errorId = document.getElementById('error-div');
    const startError = document.getElementById('start-error');
    const endError = document.getElementById('end-error');
    let message;
    let flag = true;

    if (!startDate.value || !endDate.value) {
        message = 'Please select both start date and end date.';
        showError(null, errorId, message);
        flag = false;
    }

    if (startDate.value > endDate.value && endDate.value !== "") {
        message = 'Start date cannot be greater than end date.';
        showError(startDate, startError, message);
        flag = false;
    }

    if (startDate.value > currentDate) {
        message = "Start date must be less than or equal to the current date.";
        showError(startDate, startError, message);
        flag = false;
    }

    if (endDate.value > currentDate) {
        message = "End date must be less than or equal to the current date.";
        showError(endDate, endError, message);
        flag = false;
    }

    if (flag) {
        window.location.href = `/admin/sales-report?start=${startDate.value}&end=${endDate.value}`;
    } else {
        return flag;
    }
});
