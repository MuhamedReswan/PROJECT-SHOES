function addToCart(productId) {
    let data = { productId: productId }

    $.ajax({
       method : 'POST',
        url: '/addtocart',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (res) => {
            if (res.added) {
setTimeout(()=>{
window.location.reload()
},1500)
                swal.fire({
                    title: `Added to cart`,
                    icon: "success",
                    showConfirmationButton: false,
                    timer: 1500
                })
            }

            if (res.exist) {
                swal.fire({
                    icon: 'warning',
                    title: 'Already exist',
                    timer: 1000
                })
            }
        },
        error: (error) => {
            console.log(error);
        }

    })
}

function removeFromWishlist(productId) {
    console.log('addToCart')
    let data = { productId: productId }

    $.ajax({
       method : 'POST',
        url: '/remove-wishlist',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (res) => {
            if (res.removed) {
                $('.pageWrapper').load('/wishlist .pageWrapper',null,()=>{
                    swal.fire({
                    title: `succesfully removed`,
                    icon: "success",
                    showConfirmationButton: false,
                    timer: 1000
                })
                })
               
            }                            
        },
        error: (error) => {
            console.log(error);
        }

    })
}
