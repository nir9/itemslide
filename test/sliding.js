var carousel;

$(document).ready(function () {
    carousel = $("#scrolling ul");

    carousel.itemslide({
        swipe_out: true,
        remove_deprecated_external_functions: true
    });

    $(window).resize(function () {
        carousel.reload();
    });
});
