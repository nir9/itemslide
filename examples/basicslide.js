$(document).ready(function (){
	$("ul").initslide(
        /*{
            disable_slide:true,
            duration:1500
        }*/
    );//initialize itemslide

    $("ul").on('pan', function(event) {
        console.log("PANNING OCCURED!!");
    });

    $("ul").on('changeActiveItem', function(event) {
        console.log("changeActiveItem OCCURED!!");
    });

    $( window ).resize(function() {
  $("ul").reload();
});
});
