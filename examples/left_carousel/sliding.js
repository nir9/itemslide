var carousel;
$(document).ready(function () {

    carousel = $("ul");

    carousel.itemslide({
        left_sided: true
    }); //initialize itemslide

    $(window).resize(function () {
        carousel.reload();
    }); //Recalculate width and center positions and sizes when window is resized
});
