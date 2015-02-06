$(document).ready(function () {

    $("ul").itemslide({

    }); //initialize itemslide

    $(window).resize(function () {
        $("ul").reload();

    }); //Recalculate width and center positions and sizes when window is resized
});
