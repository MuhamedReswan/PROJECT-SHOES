
function listAndUnlist(id) {
    let data = { productId: id }

    Swal.fire({
        title: "Are you sure?",
        text: `Do you want to List or Unlist this product ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes,!",
        width:"300px"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                method: 'POST',
                url: '/admin/products-list',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (res) {
                    console.log('hollo', res);
                    if (res.result) {
                        Swal.fire({
                            title: "Done!",
                            icon: "success",
                            timer: 1000
                        });
                        $('#reloadList').load('/admin/products-list #reloadList')


                    } else {

                    }
                }, error: function (error) {
                    console.log(error)
                }
            })
        }
    });
}



function removeAppliedOffer(productId, offerId) {
    let data = { productId, offerId }

    axios.post('/admin/product/remove-offer',
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
                $('#reloadList').load('/admin/products-list #reloadList');
            }, 1000)

        }

        if (!response.data.removed) {
            Swal.fire({
                icon: "error",
                text: `${response.data.message}`,
                width: "300px",
                timer: 1000
            });
        }

    }).then((error) => {
        console.log(error)
    })
}

let nameSearchProduct = document.getElementById('product-name-search');

nameSearchProduct.addEventListener('keyup', (event) => {

})



document.addEventListener('DOMContentLoaded', () => {

    let searchInput = document.getElementById('product-Search');
    searchInput.addEventListener('keyup', () => {

        let searchTerm = searchInput.value.toLowerCase();
        let tableRow = document.querySelectorAll('#productTable tbody tr');

        tableRow.forEach(function (row) {
            let nameColoumn = row.querySelector('td:nth-child(2)');

            if (nameColoumn) {
                let nameText = nameColoumn.textContent.toLowerCase()
                row.style.display = nameText.includes(searchTerm) ? "" : "none";
            }
        })
    })
})
