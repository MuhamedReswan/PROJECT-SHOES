function block(id, event) {
    event.preventDefault();
    const data = { id: id }

    Swal.fire({
        title: "Are you sure?",
        text: `Do you want to block/Unblock this user !`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes!",
    }).then((result) => {
        if (result.isConfirmed) {

            $.ajax({

                method: "post",
                url: "/admin/block-user",
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: (Response) => {
                    if (Response.block == true) {

                        $('#reload').load('/admin/customers #reload', null, () => {
                            Swal.fire({
                                title: `Done`,
                                icon: "success",
                                timer: 1000

                            });

                        })
                    }
                }

            });


        }
    });
}





document.addEventListener('DOMContentLoaded', () => {

    let searchInput = document.getElementById('customersSearch');
    searchInput.addEventListener('keyup', () => {

        let searchTerm = searchInput.value.toLowerCase();
        let tableRow = document.querySelectorAll('#customerTable tbody tr');

        tableRow.forEach(function (row) {
            let nameColoumn = row.querySelector('td:nth-child(2)');

            if (nameColoumn) {
                let nameText = nameColoumn.textContent.toLowerCase()
                row.style.display = nameText.includes(searchTerm) ? "" : "none";
            }
        })


    })
})



