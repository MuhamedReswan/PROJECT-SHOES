document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    let submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', validateOffer)

  })


  function editValidation() {
    console.log('editValidation function invoked')//----------------------

    let commonError = document.getElementById('common-error');
    let nameError = document.getElementById('name-error');
    let dateError = document.getElementById('expire-date-error');
    let discountError = document.getElementById('discount-error');

    let name = document.getElementById('name');
    let endDate = document.getElementById('expire-date');
    let discount = document.getElementById('discount');
    let isListed = document.getElementById('is-listed');
    let offerId = document.getElementById('offer-id');



    let lettersRegex = /^[A-Za-z ]+$/;
    let message;


    function showError(inputId, errorId, message) {

      if(errorId == commonError){
        errorId.style.fontSize = "14px";
      }else{
        errorId.style.fontSize = "12px";
      }

      errorId.style.color = "red";
      errorId.innerText = `${message}`;

      if (inputId != null) {
        inputId.style.border = "1px solid red";
      }


      setTimeout(() => {
        if (inputId != null) {
          inputId.style.border = "";
        } errorId.innerText = "";

      }, 3000);
    }




    if (name.value.trim() === '' || discount.value.trim() === '' || endDate.value.trim() === '') {
      message = 'Please fill all fields !'

      showError(null, commonError, message);
      return false
    }
    else if (name.value.trim() === '' || name.value.trim().length < 3 || name.value.trim().length > 20 || !lettersRegex.test(name.value)) {
      message = "Please fill proper offer name ! (name only contain letters 4-20 letters)"
      showError(name, nameError, message);
      return false;

    } else if (discount.value > 95 || discount.value <= 0) {
      message = "Please enter a valid offer percentage (1-95)"
      showError(discount, discountError, message);
      return false;

    } else if (new Date(endDate.value) <= new Date()) {
      message = "Please enter a valid future date !"
      showError(endDate, dateError, message);
      return false;

    } else {

      let data = {
        name: name.value,
        discount: discount.value,
        endDate: endDate.value,
        offerId:offerId.value
      }

      fetch('/admin/offers/edit-offer', {
        method: 'post',
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
      }).then((res) => res.json())
        .then((response) => {

          if(response.already){

            showError(name, commonError,response.already);
          }

          if (response.success) {

            Swal.fire({
              text: "Offer updated successful !",
              width: "300px",
              icon: "success",
              timer: 1500
            });

            setTimeout(() => {
              window.location.href = "/admin/offers"
            }, 2000)
          }
        })
        .catch((err) => {
          console.log(err)
        })

      return true;
    }
  }
