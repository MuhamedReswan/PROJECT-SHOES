function changeOrderStatus(orderStatus, orderId) {
    Swal.fire({
title: "Are you sure?",
text: "You won't be able to revert this!",
icon: "warning",
showCancelButton: true,
confirmButtonColor: "#3085d6",
cancelButtonColor: "#d33",
confirmButtonText: "Yes,!",
width: '300px',
}).then((result) => {
if (result.isConfirmed) {

fetch('/admin/change-order-status?id=' + orderId, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderStatus })
    })
    .then((res) => {
            return res.json();
        })
        .then((response) => {

            if (response.statusUpdated) {
                $('#orders').load('/admin/orders #orders')
            }
        }).catch((error) => {
            console.error('Error:', error);
        })

Swal.fire({
title: "Done !",
text: "Order status has been changed.",
icon: "success",
width: '300px',
timer:1000
});
}
});
}



document.addEventListener('DOMContentLoaded', () => {

let searchInput = document.getElementById('order-name-Search');
searchInput.addEventListener('keyup', () => {

let searchTerm = searchInput.value.toLowerCase();
let tableRow = document.querySelectorAll('#orderTable tbody tr');

tableRow.forEach(function (row) {
let nameColoumn = row.querySelector('td:nth-child(2)');

if (nameColoumn) {
let nameText = nameColoumn.textContent.toLowerCase()
row.style.display = nameText.includes(searchTerm) ? "" : "none";
}
})


})
})

