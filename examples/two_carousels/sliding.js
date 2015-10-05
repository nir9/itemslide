var carousel;
$(document).ready(function () {

    carousel = $("#scrolling ul");

    carousel.itemslide({

    }); //initialize itemslide

    carousel2 = $("#scrolling2 ul");

    carousel2.itemslide({

    }); //initialize itemslide

    $(window).resize(function () {
        carousel.reload();
        carousel2.reload();
    }); //Recalculate width and center positions and sizes when window is resized
});
