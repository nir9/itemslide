$(document).ready(function (){

	$("ul").itemslide(
        {
            swipe_out: true //NOTE: REMOVE THIS OPTION IF YOU WANT TO DISABLE THE SWIPING SLIDES OUT FEATURE.
        }
    );//initialize itemslide

    /*$("ul").on('pan', function(event) {
        console.log("PANNING OCCURED!!");
    }); //triggered when user pans

    $("ul").on('changeActiveIndex', function(event) {
        console.log("changeActiveIndex OCCURED!!");
    }); //triggered when current active item has changed
    */

    /*$("ul").on('changePos', function(event) {
        console.log("new pos: "+ $("ul").getCurrentPos());
    }); //triggered when position of carousel has changed*/

    /*$("ul").on('swipeout', function(event) {
        console.log("swiped out slide - " + event.slide);
    });*/


    $( window ).resize(function() {
        $("ul").reload();
    });//Recalculate width and center positions and sizes when window is resized








});
