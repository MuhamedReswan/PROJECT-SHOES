document.addEventListener('DOMContentLoaded', function () {

    let loginData = document.getElementById('success-login');
    let loginSuccess = loginData.getAttribute('data-success');
    console.log("admin home kscritpt loginSuccess ", loginSuccess)
    if (typeof (loginSuccess) !== undefined) {


        Swal.fire({
            icon: 'success',
            text: "loged",
            timer: "1500",
            toast: true,
            width: "300px",
            showConfirmButton: false,
        }, 1000);
        loginData.setAttribute('data-success', undefined);
    }
});





jQuery(document).ready(function () {
    jQuery('.closepopup').on('click', function () {
        jQuery('#popup-container').fadeOut();
        jQuery('#modalOverly').fadeOut();
    });

    var visits = jQuery.cookie('visits') || 0;
    visits++;
    jQuery.cookie('visits', visits, { expires: 1, path: '/' });
    console.debug(jQuery.cookie('visits'));
    if (jQuery.cookie('visits') > 1) {
        jQuery('#modalOverly').hide();
        jQuery('#popup-container').hide();
    } else {
        var pageHeight = jQuery(document).height();
        jQuery('<div id="modalOverly"></div>').insertBefore('body');
        jQuery('#modalOverly').css("height", pageHeight);
        jQuery('#popup-container').show();
    }
    if (jQuery.cookie('noShowWelcome')) { jQuery('#popup-container').hide(); jQuery('#active-popup').hide(); }
});

jQuery(document).mouseup(function (e) {
    var container = jQuery('#popup-container');
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.fadeOut();
        jQuery('#modalOverly').fadeIn(200);
        jQuery('#modalOverly').hide();
    }
});