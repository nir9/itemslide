var carousel;
$(document).ready(function () {

    carousel = $("ul");

    carousel.itemslide({

    }); //initialize itemslide

    $(window).resize(function () {
        carousel.reload();

    }); //Recalculate width and center positions and sizes when window is resized
});
