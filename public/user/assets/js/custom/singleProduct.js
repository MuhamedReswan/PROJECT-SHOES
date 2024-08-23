
function addtocart(id) {
    console.log('im in function')//-----------
    let quantity = document.getElementById('Quantity').value;
    let data = { productId: id, quantity: quantity }

    $.ajax({
        method: "POST",
        url: '/addtocart',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (res) {
            if (res.added == true || res.exist) {
                Swal.fire({
                    title: `Added to cart`,
                    icon: "success",
                    showConfirmationButton: false,
                    width: '300px',
                    timer: 1000
                })

                let anchor = document.createElement("a");

                anchor.setAttribute("id", "addToCartBtn");
                anchor.setAttribute("href", "/cart");
                anchor.setAttribute("name", "add");
                anchor.setAttribute("class", "btn product-form__cart-submit");
                anchor.setAttribute("style", "margin-top: 2px");

                let span = document.createElement('span');
                span.textContent = 'view cart';

                anchor.appendChild(span);
                let container = document.querySelector('.product-form__item--submit');
                container.innerHTML = '';

                container.appendChild(anchor);
                
                setTimeout(()=>{
// window.location.href=`/single-product?id=${id}`
                },1500)

                $('#nav-icons').onload(`/single-product?id=${id} #nav-icons`)
            }
        },
        error: function (error) {
            console.log(error);
        }
    })
}

function checkCart(productId) {
    console.log('hey clicked')//---------
    console.log(productId)
    if (!productId) {
        console.log('data not found');
        return;
    }
    const data = { productId }

    $.ajax({
        url: '/check-cart',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (res) {
            if (res.exist) {

                let anchor = document.createElement("a");

                anchor.setAttribute("id", "addToCartBtn");
                anchor.setAttribute("href", "/cart");
                anchor.setAttribute("name", "add");
                anchor.setAttribute("class", "btn product-form__cart-submit");
                anchor.setAttribute("style", "margin-top: 2px");
                let span = document.createElement('span');
                span.textContent = 'view cart';


                anchor.appendChild(span);
                let container = document.querySelector('.product-form__item--submit');
                container.innerHTML = '';

                container.appendChild(anchor);


            }
            else if (res.not) {
                let button = document.createElement('button');

                button.setAttribute('id', 'addToCartBtn');
                button.setAttribute('type', 'button');
                button.setAttribute('name', 'add');
                button.classList.add('btn', 'product-form__cart-submit');
                button.setAttribute('onclick', "addtocart('" + res.productId + "')");

                let span = document.createElement('span');
                span.innerText = 'add to cart';
                button.appendChild(span);

                let container = document.querySelector('.product-form__item--submit');
                container.innerHTML = '';

                container.appendChild(button);
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

const buttonDiv = document.getElementById('buttons');

function addToWishlist(productId, id) {
    let data = { productId: productId }

    $.ajax({
        method: 'post',
        url: '/add-to-wishlist',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (res) => {
            if (res.added) {

                $('#buttons').load(`/single-product?id=${productId} #buttons`, null, function () {
                    swal.fire({
                        title: 'Added',
                        icon: 'success',
                        text: 'successfully added to wishlist !',
                        width: '300px',
                        timer: 1000
                    })
                })
            }
            if (res.exist) {

                removeWishlist(id)
                $('#buttons').onload(`/single-product?id=${id} #buttons`, null, () => {
                    swal.fire({
                        title: `succesfully removed`,
                        icon: "success",
                        showConfirmationButton: false,
                        width: '300px',
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

function viewWishlist(id) {
    const button = document.getElementById(`${id}`);
    button.innerText = 'View Wishlist'
    button.removeAttribute('onclick');

    let a = document.createElement('a')
    a.setAttribute('href', '/wishlist')
    a.appendChild(button);
}

function removeWishlist(id) {
    const button = document.getElementById(`${id}`);
    button.innerText = 'View Wishlist'
    button.setAttribute('onclick', '<%= product._id %>')

}







$(function () {
    let $pswp = $('.pswp')[0],
        image = [],
        getItems = function () {
            let items = [];
            $('.lightboximages a').each(function () {
                let $href = $(this).attr('href'),
                    $size = $(this).data('size').split('x'),
                    item = {
                        src: $href,
                        w: $size[0],
                        h: $size[1]
                    }
                items.push(item);
            });
            return items;
        }
    let items = getItems();

    $.each(items, function (index, value) {
        image[index] = new Image();
        image[index].src = value['src'];
    });
    $('.prlightbox').on('click', function (event) {
        event.preventDefault();

        let $index = $(".active-thumb").parent().attr('data-slick-index');
        $index++;
        $index = $index - 1;

        let options = {
            index: $index,
            bgOpacity: 0.9,
            showHideOpacity: true
        }
        let lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
        lightBox.init();
    });
});