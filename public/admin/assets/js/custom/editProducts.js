
function previewImages(input, index) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function(e) {
            $('#imagePreview' + (parseInt(index) + 1)).attr('src', e.target.result);
            let fileName = input.files[0].name;
            $('#imageInput' + (parseInt(index) + 1)).siblings('.image-name').val(fileName);
            
            // Create and append the hidden input field for old image
            let oldImageInput = $('<input>').attr({
                type: 'hidden',
                name: 'index',
                id: 'oldImageInput' + (parseInt(index) + 1),
                class: 'oldImageInput',
                value: index
            });
            $('#imageInput' + (parseInt(index) + 1)).after(oldImageInput);
        }

        reader.readAsDataURL(input.files[0]);
    }
}




    function editValidateForm() {
    let name = document.getElementById('product_title').value.trim();
    let description = document.getElementById('description').value.trim();
    let price = document.getElementById('price').value.trim();
    let brand = document.getElementById('product_brand').value.trim();
    let offerPrice = document.getElementById('offer_Price').value.trim();
    let quantity = document.getElementById('quantity').value.trim();    

    let lettersAndNumbersRegex = /^[a-zA-Z\s]*$/;
    let errorMessageContainer = document.getElementById('errorMessages');

    errorMessageContainer.innerHTML = '';

    if (!name || !description || !price || !brand || !offerPrice || !quantity) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center  justify-content-center " role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Please fill all fields.</div></div>';
        setTimeout(function() {
                    errorMessageContainer.innerHTML = '';
                }, 3000);
                return false;
    
    } else if (name.trim() === "" || description.trim() === "" || price.trim() === "") {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Please fill properly, remove blank spaces.</div></div>';
        setTimeout(function() {
                    errorMessageContainer.innerHTML = '';
                }, 3000);
                 return false;
    
    } else if (!lettersAndNumbersRegex.test(name)) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Product name should only contain letters.</div></div>';
        setTimeout(function() {
                    errorMessageContainer.innerHTML = '';
                }, 3000);
                return false;
    
    } else if (description.length <= 20) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Description should contain at least 20 letters.</div></div>';
        setTimeout(function() {
                    errorMessageContainer.innerHTML = '';
                }, 3000);
                 return false;
    
    } else if (Number(price) <= 0) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Price must be a positive number.</div></div>';
        setTimeout(function() {
                    errorMessageContainer.innerHTML = '';
                }, 3000);
                return false;

    } else if (Number(quantity) <= 0) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Quantity must be a positive number.</div></div>';
        setTimeout(function() {
                    errorMessageContainer.innerHTML = '';
                }, 3000);
                return false;

    
    } else if (Number(offerPrice) <= 0) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Offer Price must be a positive number.</div></div>';
        setTimeout(function() {
                    errorMessageContainer.innerHTML = '';
                }, 3000);
                 return false;
    
    } else if (Number(offerPrice) > Number(price)) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Offer Price should be less than Price.</div></div>';
        setTimeout(function() {
                    errorMessageContainer.innerHTML = '';
                }, 3000);
                 return false;
            }
    
    return true;   
}

