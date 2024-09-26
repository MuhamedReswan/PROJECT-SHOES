// not working









// document.addEventListener('DOMContentLoaded', (event) => {
//     const form = document.getElementById('bannerForm');
//     const imageInput = document.getElementById('imageInput');
//     const imagePreview = document.getElementById('imagePreview');
//     const errorMessages = document.getElementById('errorMessages');
//     const submitButton = document.getElementById('submitButton');

//     function previewImages(input) {
//       const reader = new FileReader();
//       reader.onload = function(e) {
//         imagePreview.src = e.target.result;
//         imagePreview.style.display = 'block';
//       };
//       reader.readAsDataURL(input.files[0]);
//     }

//     imageInput.addEventListener('change', function() {
//       if (this.files && this.files[0]) {
//         previewImages(this);
//       }
//     });

//     function validateBannerForm() {
//       const name = document.getElementById('name').value.trim();
//       const description = document.getElementById('description').value.trim();
//       const url = document.getElementById('url').value.trim();
//       const imageFile = imageInput.files.length;
//       let expireDate = document.getElementById('Expire-date').value.trim();
//       let currentDate = Date.now()

//       let valid = true;
//       errorMessages.innerText = '';

//       if (!name || !description || !url) {
//         errorMessages.innerText = 'Please fill all fields!';
//         valid = false;
//       } else if (description.length < 20) {
//         errorMessages.innerText = 'Description should contain at least 20 characters.';
//         valid = false;
//       } else if (!/^[A-Za-z\s]+$/.test(url)) {
//         errorMessages.innerText = 'Description only allowed leteters and space.';
//         valid = false;
//       } else if (imageFile < 1) {
//         errorMessages.innerText = 'Please add an image.';
//         valid = false;
//       }
//       else if (new Date(expireDate) <new Date() ) {
//         errorMessages.innerText = 'Please enter a future date';
//         valid = false;
//       }
//       return valid;
//     }

//     submitButton.addEventListener('click', async function() {
//       if (!validateBannerForm()) {
//         return;
//       }

//       const formData = new FormData(form);
//           // Optional: Display the form data in the console
//   for (const [key, value] of formData.entries()) {
//     console.log(`${key}: ${value}`);
//   }

//   // formData.append('image', imageInput.file);
// console.log("form data====== ",formData )//---------------------------------
//       try {
//        fetch('/admin/banners/add-banner', {
//           method: 'POST',
//           body: formData
//         })
//         .then((res)=>{
//           console.log("res",res)//-------------------
//          return res.json()})
//         .then((result)=>{
//           console.log("fetch reslul",result)//---------------
//           if (result.success) {
//           Swal.fire({
//             text: "Banner added successfully!",
//             width: "300px",
//             icon: "success",
//             timer: 1000
//           });

//           setTimeout(() => {
//             window.location.href = "/admin/banners";
//           }, 2000);
//         } else {
//           errorMessages.innerText = result.error || 'reslut false. Please try again.';
//         }

//         })
//         .catch((error)=>{
//           console.log(error.message)
//         })


    
//       } catch (error) {
//         console.error('Error:', error);
//         errorMessages.innerText = 'An error occurred. Please try again.';
//       }
//     });
//   });