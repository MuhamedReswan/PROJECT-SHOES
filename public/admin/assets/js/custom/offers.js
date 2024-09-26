
function changeStatus(offerId, status) {

    let data = { offerId, status }

    swal.fire({
        icon: "question",
        title: "Are you sure?",
        text: "Do you want to change status.",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!",
        width: '300px'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                method: "POST",
                url: '/admin/offers/change-status',
                data: data,
                success: (response) => {
                    if (response.statusChanged) {
                        Swal.fire({
                            text: "Status successfully changed !",
                            width: "300px",
                            icon: "success",
                            timer: 1000
                        });

                        setTimeout(() => {
                            window.location.href = "/admin/offers"
                        }, 1000)
                    }

                    if (!response.statusChanged) {

                        Swal.fire({
                            text: `${response.message}`,
                            width: "300px",
                            icon: "error",
                            timer: 1500
                        });
                    }
                },
                error: (err) => {
                    console.log('ajax error', err);
                }

            })
        }
    })
}

