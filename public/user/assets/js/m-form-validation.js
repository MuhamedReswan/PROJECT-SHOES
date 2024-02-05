
function validate(){


    const username = document.getElementById('uname');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const conform = document.getElementById('conform');

    // const lname = document.getElementById('lname');
    // const namevalue = lname.value;
    // console.log('js file here');
    

    if (!/^\w+$/.test(username.value)){
        console.log("im in function")

        username.style.border = 'solid 1px red';
            userError.textContent ="Please Enter Valid User Name"
        setTimeout(()=>{

            username.style.border ="";
            userError.textContent ="";
            // lname.value=namevalue;

        },3000);
        return false;

    }else if(email.value.indexOf('@')==-1 || !email.value.endsWith("@gmail.com" || email.value.trim()=="")){

        console.log("im in email")

        email.style.border = 'solid 1px red';
        emailError.textContent = 'Please Enter Valid Email'
        setTimeout(()=>{

            email.style.border ="";
            emailError.textContent ="";
        },3000)

    return false;

    }else if (phone.value.trim().length !== 10 || !/^\d+$/.test(phone.value)){
        console.log("im in mobile")

        phone.style.border ='solid 1px red';
        phoneError.textContent = 'Mobile number should be an Number with  10 digits';
        setTimeout(()=>{

            phone.style.border ="";
            phoneError.textContent =""
        },3000) 

return false;

    }else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password.value)){
        console.log("im in password")

        password.style.border = 'solid 1px red';
        passwordError.textContent =  "Password must be atleast 6 charcaters long and contain atleast one uppercase letter one lowercase letter,and one number";       
        setTimeout(()=>{
            password.style.border ="";
            passwordError.textContent ="";
         },3000);

         return false

    }else if (password.value !== conform.value){
        console.log("im in conform")

        conform.style.border = 'solid 1px red';
        passwordError2.textContent = 'Password Should Be Same';
        setTimeout(()=>{
            passwordError2.textContent ="";
            conform.style.border = "";
        },3000);

return false

    }else{

        return true;

    }

}



function alert(id) {
    setTimeout(() => {
        id.style.border = '';
        id.textContent = '';
        id.classList.remove('custom_alert');
    }, 3000); 
}

//  const serverError = document.querySelector('.serverError');

//  setTimeout(() => {
// serverError.style.display = 'none'
//  },3000)

