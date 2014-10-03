(function ($) {
    var accel = 0;
    var overallslide = 0;
    var sensitivity = 10;
    var slides;
    var currentIndex = 0;
    
    //Waypoints check position relative to waypoint and decide if to scroll to or not...
    $.fn.initslide = function (options) {

        
        // (WIDTH of (this) - WIDTH of slide)/2


        var defaults = {
            duration: 275,
            pan_sensitivity: 10,
            swipe_sensitivity: 250
        };

        var settings = $.extend({}, defaults, options);

        /*console.log(settings.duration);*/
        slides = $(this); //Saves the object given to the plugin in a variable



        console.log(slides.css("width"));

        slides.css("left", ($("body").css("width").replace("px", "") - slides.css("left").replace("px", "") - slides.children('li').css("width").replace("px", "")) / 2); //Centerize sliding area

        console.log(slides.css("left"));


        $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', 'active');

        var mc = new Hammer(slides.get(0)); //Retrieve DOM Elements to create hammer.js object
        var disable = false;
        mc.on("panleft panright", function (ev) { //Hammerjs pan(drag) event happens very fast

            console.log("YAYY");
            if (!disable) {
                slides.css("left", "-=" + ev.velocityX * settings.pan_sensitivity); //Change x of slides to velocity of drag
            } else {
                disable = false;
            }
        });
        mc.on("swipe", function (ev) { //Hammerjs Swipe (called when mouse realsed after mouse down)


            console.log(ev.velocityX);



            /*slides.animate({
                left: "-=" + (ev.velocityX * 250)
            }, {
                duration: speed,
                easing: 'easeOutQuart' //Choose easing from easing plugin http://gsgd.co.uk/sandbox/jquery/easing/
            });*/
            slides.animateWithCss({
                left: "-=" + (ev.velocityX * settings.swipe_sensitivity)
            }, settings.duration, 'easeOutQuart');

            disable = true;

        }, {
            velocity: 0.05, //minimum velocity
            threshold: 0 //Minimum distance
        });



    }


    $.fn.next = function () { //Next slide
        changeActiveSlideTo(currentIndex + 1);
    }

    function changeActiveSlideTo(i) {
        $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', '');
        currentIndex = i;
        console.log("new index: " + currentIndex);
        $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', 'active');
    }
    
    function getLandingSlideIndex(x){
for(var i=0;i<slides.children.length)
{
	if(slides.children(i).css("left") > x && slides.children(i).css("left")+slides.children(i).css("width") < x)
	{
	    console.log(i)
		return i;
	}
}
}

function gotoSlideByIndex(i)
{
	
}

})(jQuery);
