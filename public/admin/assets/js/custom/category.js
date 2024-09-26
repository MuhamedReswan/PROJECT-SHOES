function clicked(id) {
    var data = { id: id }

    swal.fire({
        title: "Are you sure?",
        text: `Do you want List / Unlist  this user !`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!",
        width: "300px",

    }).then((result) => {


        console.log(Response)
        if (result.isConfirmed) {
            $.ajax({
                method: 'POST',
                url: '/admin/list-category',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: (Response) => {
                    console.log('response', Response); // Log the response to check its content
                    if (Response.list) {
                        window.location.reload();
                    } else {
                        console.log('Reload failed');
                    }

                },
                error: function (error) {
                    console.log('AJAX error:', error);
                }
            });

        } else {

        }

    })
}


function removeCatogoryAppliedOffer(categoryId, offerId) {
    console.log("removeAppliedOffer invoked")
    console.log("categoryId", categoryId)
    console.log("within remove appliedoffer")
    let data = { categoryId, offerId }

    axios.post('/admin/category/remove-offer',
        data
    ).then((response) => {
        if (response.data.removed) {

            Swal.fire({
                icon: "success",
                text: `${response.data.message}`,
                width: "300px",
                timer: 1000
            });
            setTimeout(() => {
                $('#category-table').load('/admin/category #category-table');
            }, 1000)

        }
        if (!response.data.removed) {
            Swal.fire({
                icon: "error",
                text: `${response.data.message}`,
                width: "300px",
                timer: 1500
            });
        }

    }).then((error) => {
        console.log(error)
    })
}