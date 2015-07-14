var carousel;

$(document).ready(function (){

    carousel = $("#scrolling ul").itemslide(
        {
            swipe_out: true, //NOTE: REMOVE THIS OPTION IF YOU WANT TO DISABLE THE SWIPING SLIDES OUT FEATURE.
            disable_clicktoslide: false,
            align: 'left',
            leftToggle: '.do-scroll-left',
            rightToggle: '.do-scroll-right'
        }
    );//initialize itemslide

    /*carousel.on('pan', function(event) {
        console.log("PANNING OCCURED!!");
    }); //triggered when user pans

    carousel.on('changeActiveIndex', function(event) {
        console.log("changeActiveIndex OCCURED!!");
    }); //triggered when current active item has changed
    */

    /*carousel.on('changePos', function(event) {
        console.log("new pos: "+ carousel.getCurrentPos());
    }); //triggered when position of carousel has changed*/

    /*carousel.on('swipeout', function(event) {
        console.log("swiped out slide - " + event.slide);
    });*/


    $( window ).resize(function() {
        carousel.reload();
    });//Recalculate width and center positions and sizes when window is resized


});
