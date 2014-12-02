$(document).ready(function (){

	$("ul").initslide(
        /*{
            disable_slide:true,
            duration:1500
        }*/
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
    }); //triggered when position of carousel has changed
    */


    $( window ).resize(function() {
        $("ul").reload();

    });//Recalculate width and center positions and sizes when window is resized








});
