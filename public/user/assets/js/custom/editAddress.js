
let submit = document.getElementById('submit-button');
submit.addEventListener('click',addAddressValidation);

    function addAddressValidation() {
        event.preventDefault(); // Prevent form submission if validation fails
        console.log('im add-address validation');
        // Get form fields
        const name = document.getElementById('input-firstname').value.trim();
        const id = document.getElementById('input-firstname').getAttribute('data-id')
        const mobile = document.getElementById('input-telephone').value.trim();
        const address = document.getElementById('input-address-1').value.trim();
        const district = document.getElementById('input-district').value.trim();
        const city = document.getElementById('input-city').value.trim();
        const pincode = document.getElementById('input-postcode').value.trim();
        const state = document.getElementById('input-state').value.trim();
        const country = document.getElementById('input-country').value.trim();

        // Regular expressions for validation
        const nameRegex =/^(?!.*\d)[^\W\d]\w*$/;
        const mobileRegex = /^\d{10}$/;
        const textRegex = /^[^\d]+$/;
        const pincodeRegex = /^\d{6}$/;

        // Error messages
        const errors = [];

        // Validate each field
        if (!nameRegex.test(name) || name == '') {
            errors.push('Please enter a proper name');
            document.getElementById('input-firstname').classList.add('error');
            displayErrors(errors);
            return false;
        }

        if (!mobileRegex.test(mobile) || mobile.length > 10 || mobile.length < 10) {
            errors.push('Mobile number should be 10 digits.');
            document.getElementById('input-telephone').classList.add('error');
            displayErrors(errors);
            return false;
        }


        if (!textRegex.test(address) || address == '') {
            errors.push('Please enter a valid address');
            document.getElementById('input-address-1').classList.add('error');
            displayErrors(errors);
            return false;
        }

        if (!textRegex.test(district) || district == '') {
            errors.push('Please enter a valid distric name.');
            document.getElementById('input-district').classList.add('error');
            displayErrors(errors);
            return false;
        }

        if (!textRegex.test(city) || city == '') {
            errors.push('Please enter a valid city name.');
            document.getElementById('input-city').classList.add('error');
            displayErrors(errors);
            return false;
        }

        if (!pincodeRegex.test(pincode) || pincode == '') {
            errors.push('Pincode should be 6 digits.');
            document.getElementById('input-postcode').classList.add('error');
            displayErrors(errors);
            return false;
        }

        // If all validations pass, return true
        console.log('validation success');       

let data={name, mobile, address, district, city, pincode, country, state, id }

        fetch('/edit-address',{
            method:'Post',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(data)
        })
        .then(res=> res.json())
        .then((res)=>{
           if(res.success){
            setTimeout(() => {
                window.location.href = '/profile'
            }, 1000);
            
           }
        })
    }

    function displayErrors(errors) {
        // Display error messages
        const errorContainer = document.getElementById('error-container');
        errorContainer.innerHTML = errors.map(error => `<strong><p class="text-danger">${error}</p></strong>`).join('');
        errorContainer.style.display = 'block';
        setTimeout(() => {
            errorContainer.innerHTML = ""
        }, 3000)
    }

    // Remove error class on input focus
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => {
            input.classList.remove('error');
            document.getElementById('error-container').style.display = '';
        });
    });