function previewImages(input) {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = ''; // Clear previous previews

    const files = input.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview';
            img.style.height = '150px';
            img.style.width = '150px';

            const fileName = document.createElement('p');
            fileName.textContent = file.name;
            fileName.style.whiteSpace = 'nowrap'; // Prevent line breaks
            fileName.style.overflow = 'hidden'; // Hide overflow text
            fileName.style.textOverflow = 'ellipsis'; // Show ellipsis (...) for overflow text
            fileName.style.width = '100%'; // Ensure the file name stays within its container

            const changeBtn = document.createElement('button');
            changeBtn.textContent = 'Change Image';
            changeBtn.onclick = function () {
                const newInput = document.createElement('input');
                newInput.type = 'file';
                newInput.accept = 'image/*';
                newInput.onchange = function (event) {
                    const newFile = event.target.files[0];
                    const newReader = new FileReader();
                    newReader.onload = function (evt) {
                        img.src = evt.target.result;
                        fileName.textContent = newFile.name; // Update file name
                    };
                    newReader.readAsDataURL(newFile);
                };
                newInput.click();
            };

            const previewDiv = document.createElement('div');
            previewDiv.className = 'col-lg-3 col-md-4 mb-3';
            previewDiv.appendChild(img);
            previewDiv.appendChild(fileName);
            previewDiv.appendChild(changeBtn);
            previewContainer.appendChild(previewDiv);
        };

        reader.readAsDataURL(file);
    }
}





function showErrorMessage(message, errorId) {
    const errorMessageContainer = document.getElementById(errorId);
    console.log('errorMessageContainer', errorMessageContainer, message);//---------------------------

    errorMessageContainer.innerHTML += `<div class="alert alert-danger d-flex align-items-center text-danger>${message}</div>`;

    setTimeout(function () {
        errorMessageContainer.innerHTML = '';
    }, 3000);
}
function validateUpdateForm() {
    console.log('im in update validation function');//--------------
    let name = document.getElementById('name').value.trim();
    let description = document.getElementById('description').value.trim();
    let price = document.getElementById('price').value.trim();
    let quantity = document.getElementById('quantity').value.trim();
    let brand = document.getElementById('brand').value.trim();
    let offerPrice = document.getElementById('offerPrice').value.trim();
    let imageInput = document.getElementById('imageInput').files.length;

    let lettersAndNumbersRegex = /^[a-zA-Z\s]*$/;
    let errorMessageContainer = document.getElementById('errorMessages');

    errorMessageContainer.innerHTML = '';

    if (!name || !description || !price || !brand || !offerPrice || !quantity) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center  justify-content-center " role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Please fill all fields.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (name === "" || description === "" || price === "" || quantity === "") {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Please fill properly, remove blank spaces.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (!lettersAndNumbersRegex.test(name)) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Product name should only contain letters.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (!lettersAndNumbersRegex.test(name)) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Product name should only contain letters.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (description.length <= 20) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Description should contain at least 20 letters.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (Number(quantity) <= 0) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Quantity must be a positive number.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (Number(price) <= 0) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Price must be a positive number.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;


    } else if (Number(offerPrice) <= 0) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Offer Price must be a positive number.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (Number(offerPrice) > Number(price)) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Offer Price should be less than Price.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (imageInput < 4) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Please add 4 images of the product.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else if (imageInput > 4) {
        errorMessageContainer.innerHTML += '<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong> Only 4 images are allowed.</div></div>';
        setTimeout(function () {
            errorMessageContainer.innerHTML = '';
        }, 3000);
        return false;

    } else {
        return true;
    }

}