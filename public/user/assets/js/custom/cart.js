function removeProduct(id) {
    console.log('id-', id);//---
    console.log('remove cart function');//---
    let data = { productId: id }


    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!",
        width: '300px',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'post',
                url: '/remove-cart',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: (response) => {
                    if (response.removed == true) {
                        $('#wrapper').load('/cart #wrapper', null, () => {
                            Swal.fire({
                                title: "Removed!",
                                text: "Your product has been removed from cart.",
                                icon: "success",
                                width:"300px"
                            });
                        })

                    }
                },
                error: (error) => {
                    console.log(error);
                }

            })
        }
    });


}

function changeQuantity(productId, id, status) {
    console.log('im in change quantity 2');//---------------
    let data = { productId: productId, id: id, buttonStatus: status }
    console.log('data=', data);//----------------
    $.ajax({
        type: 'post',
        url: 'change-quantity',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (res) => {
            $('#wrapper').load('/cart #wrapper');
            if (res.min) {
                swal.fire({
                    icon: "warning",
                    title: "Oops...",
                    text: "Minimum Quantity Required !",
                    width:"300px"
                });
            } else if (res.maxQty) {
                swal.fire({
                    icon: "warning",
                    title: "Oops...",
                    text: "Maximum quantity user!",
                    width:"300px"
                });
            } else if (res.max) {
                swal.fire({
                    icon: "warning",
                    title: "Oops...",
                    text: "No More products !",
                    width:"300px"
                });
            } else if (res.update) {
                console.log('updated Sucessfuly !');
            }
        },
        error: (error) => {
            console.log(error);
        }
    });
}