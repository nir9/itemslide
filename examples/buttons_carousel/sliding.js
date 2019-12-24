var carousel;
$(document).ready(function () {

    carousel = $("ul");

    carousel.itemslide({
        remove_deprecated_external_functions: true
    }); //initialize itemslide

    $(window).resize(function () {
        carousel.reload();
    }); //Recalculate width and center positions and sizes when window is resized

    $("#next").click(function() {
        carousel.nextSlide();
    });

    $("#previous").click(function() {
        carousel.previousSlide();
    });


});
