document.addEventListener('DOMContentLoaded', (event) => {
    // Your code here
});


function changeStatus(bannerId, status) {
    console.log('change status')//--------------

    let data = { bannerId, status }

    console.log('data status', data);//-----------------------

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
        console.log("result on sjax",result)//-------------------
        if (result.isConfirmed) {
            $.ajax({
                method: "POST",
                url: '/admin/banners/change-status',
                data: data,
                success: (response) => {
                    if (response.statusChanged) {
                        console.log('response success------------', response)//---------------------------

                        Swal.fire({
                            text: "Status successfully changed !",
                            width: "300px",
                            icon: "success",
                            timer: 1000
                        });

                        setTimeout(() => {
                            window.location.href = "/admin/banners"
                        }, 1000)
                    }

                    if (!response.statusChanged) {
                        console.log('within status chnged failed');//--------------

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