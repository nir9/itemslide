var carousel;
$(document).ready(function () {

    carousel = $("#scrolling ul");

    carousel.itemslide({
        duration: 1000

    }); //initialize itemslide

    carousel2 = $("#scrolling2 ul");

    carousel2.itemslide({
        duration: 100

    }); //initialize itemslide

    $(window).resize(function () {
        carousel.reload();
        carousel2.reload();
    }); //Recalculate width and center positions and sizes when window is resized
});
