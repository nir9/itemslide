$(document).ready(function () {

    $("ul").initslide({

    }); //initialize itemslide

    $(window).resize(function () {
        $("ul").reload();

    }); //Recalculate width and center positions and sizes when window is resized
});
