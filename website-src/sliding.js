var carousel;

$(document).ready(function () {

    carousel = $("#scrolling ul");

    carousel.itemslide({
        swipe_out: true //NOTE: REMOVE THIS OPTION IF YOU WANT TO DISABLE THE SWIPING SLIDES OUT FEATURE.
    }); //initialize itemslide


    $(window).resize(function () {
        carousel.reload();
    }); //Recalculate width and center positions and sizes when window is resized



    /* Below are some examples */

    /*
    //triggered when user pans
    carousel.on('pan', function(event) {
        console.log("PANNING OCCURED!!");
    });
    */

    /*
    //triggered when current active item has changed
    carousel.on('changeActiveIndex', function(event) {
        console.log("changeActiveIndex OCCURED!!");
    });
    */

    /*
    //triggered when position of carousel has changed
    carousel.on('changePos', function(event) {
        console.log("new pos: "+ carousel.getCurrentPos());
    });
    */

    /*
    carousel.on('swipeout', function(event) {
        console.log("swiped out slide - " + event.slide);
    });
    */

    /*
    carousel.on('clickSlide', function(event) {
        console.log("Tapped tapped slide index " + event.slide + " Current Active Index: " + carousel.getActiveIndex());
    });
    */

    /*
    // Example of setting current active index as dragging
    carousel.on('changePos', function(event) {
        var currentIndex = carousel.getIndexByPosition(carousel.getCurrentPos());
        console.log("dragging active index: "+ currentIndex);
        carousel.children().removeClass('itemslide-currently-active');
        carousel.children(':nth-child(' + ((currentIndex + 1) || 0) + ')').addClass('itemslide-currently-active');
    });
    */

});
