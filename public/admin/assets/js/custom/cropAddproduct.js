document.addEventListener('DOMContentLoaded', function () {
    console.log(' DOMContentLoad')//-------------------------------------
    let inputFile = document.getElementById('imageInput');
    let previewContainer = document.getElementById('previewContainer');
    let myForm = document.getElementById('FormData');
    let croppers = [];

    inputFile.addEventListener('change', function () {
        console.log(' input file changed')//-------------------------------------
        previewContainer.innerHTML = ""
        let files = this.files

        // Iterate through selected files and create cropper instances
        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            const reader = new FileReader()

            reader.onload = function (e) {
                console.log('reader.onload(e)', e);//---------------------------------------------------
                const container = document.createElement('div')
                container.classList.add("img-container", "m-2")

                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('img-thumbnail');
                console.log("img.src", img.src)//-----------------------------------------------

                container.style.width = "200px"
                container.style.height = "200px"

                container.append(img);
                previewContainer.append(container)
                console.log("length of containier", previewContainer.children.length);//--------------------------------------- 

                // Create Cropper instance for each image
                const cropper = new Cropper(img, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0,
                });
                console.log("cropeer", cropper)//--------------------------------------------

                croppers.push(cropper)

            }
            // Read the file as Data URL
            reader.readAsDataURL(file);
        }

    });


    // Event listener for form submission
    myForm.addEventListener("submit", function (event) {
        console.log('on submit addevent listernre')//-----------------------------------------

        event.preventDefault();
        console.log("validateUpdateForm()", validateUpdateForm())//---------------------------------------------
        if (validateUpdateForm()) {
            console.log('validateUpdateForm returned true')//-----------------------------------------
            // Create FormData object
            const formData = new FormData(this);
            console.log('formaDAsat', formData)//-----------------------------------

            // Iterate through croppers and append cropped images to FormData
            croppers.forEach((cropper, index) => {
                const croppedDataUrl = cropper.getCroppedCanvas().toDataURL("image/png");
                const blob = dataURItoBlob(croppedDataUrl);

                formData.append(`images`, blob, `cropped_image_${index}.png`);
                console.log("data fornt formData", formData)//---------------------
            });

            // Fetch API to submit the form data
            fetch("/admin/add-products", {
                method: "POST",
                body: formData
            })
                .then((response) => {
                    return response.json()
                })

                .then((data) => {
                    console.log(data, '1234567899')//------------------------

                    if (data.success === true) {
                        console.log("data.message", data.message)//------------------------
                        console.log("wihtin added true ")//------------------------

                        Swal.fire({
                                title: "Added!",
                                text: "Product successfully Added !",
                                icon: "success",
                                timer:2000
                            });
                            setTimeout(()=>{
                                window.location.href = "/admin/products-list";
                            },2100)
                       
                    } else {
                        console.log("name already exist", data.message)//-----------------------------

                        Swal.fire({
                            title: "oops!",
                            text: `${data.message}`,
                            icon: "error",
                            timer:3000,
                            width:500,
                            height:100
                        });

                    }
                })
                .catch((error) => {
                    console.error('Fetch failed:', error);
                    // window.location.reload();
                });



            // Function to convert Data URI to Blob
            function dataURItoBlob(dataURI) {
                const byteString = atob(dataURI.split(",")[1]);
                const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ab], { type: mimeString });
            }
        }
    });
})


function showErrorMessage(message) {
    console.log('show');//---------------------------
    const errorMessageContainer = document.getElementById('errorMessages');
    console.log('errorMessageContainer', errorMessageContainer, message);//---------------------------

    errorMessageContainer.innerHTML += `<div class="alert alert-danger d-flex align-items-center  justify-content-center " role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg><div><strong>Hey!</strong>${message}</div></div>`; 
                   console.log('hlewsdfs');//---------------------------

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
    let errorMessageContainer = document.getElementById('errorMessages');
    let lettersAndNumbersRegex = /^[a-zA-Z\s]*$/;


    errorMessageContainer.innerHTML = '';

    if (!name || !description || !price || !brand || !offerPrice || !quantity) {
        showErrorMessage('Please fill all fields.')
        return false;

    } else if (name === "" || description === "" || price === "" || quantity === "") {
        showErrorMessage('Please fill properly, remove blank spaces.')
        return false;

    } else if (!lettersAndNumbersRegex.test(name)) {
        showErrorMessage('Product name should only contain letters.');
        return false;

    } else if (description.length <= 20) {
        showErrorMessage('Description should contain at least 20 letters.');
        return false;

    } else if (Number(quantity) <= 0) {
        showErrorMessage('Quantity must be a positive number.');
        return false;

    } else if (Number(price) <= 0) {
        showErrorMessage('Price must be a positive number.');
        return false;

    } else if (Number(offerPrice) <= 0) {
        showErrorMessage('Offer Price must be a positive number.');
        return false;

    } else if (Number(offerPrice) > Number(price)) {
        showErrorMessage('Offer Price should be less than Price.');
        return false;

    } else if (imageInput < 4) {
        showErrorMessage('Please add 4 images of the product.');
        return false;

    } else if (imageInput > 4) {
        showErrorMessage('Only 4 images are allowed.');
        return false;
    } else {
        return true;
    }

}