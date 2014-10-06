(function ($) {
    var accel = 0;
    var overallslide = 0;
    var sensitivity = 10;
    var slides;
    var currentIndex = 0;
    var settings;
    var initialLeft;
    //Waypoints check position relative to waypoint and decide if to scroll to or not...
    $.fn.initslide = function (options) {


        // (WIDTH of (this) - WIDTH of slide)/2


        var defaults = {
            duration: 300,
            pan_sensitivity: 10,
            swipe_sensitivity: 250
        };

        settings = $.extend({}, defaults, options);

        /*console.log(settings.duration);*/
        slides = $(this); //Saves the object given to the plugin in a variable

        initialLeft = slides.css("left").replace("px", "");
        console.log("initialLeft: " + initialLeft);
        console.log(slides.css("width"));

        //slides.css("left", ($("body").css("width").replace("px", "") - slides.css("left").replace("px", "") - slides.children('li').css("width").replace("px", "")) / 2); //Centerize sliding area
        gotoSlideByIndex(0);
        //slides.css("left", ($("body").css("width").replace("px", "") - slides.css("left").replace("px", "") - slides.children('li').css("width").replace("px", "")) / 2);
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
        mc.on("panend",function (ev){
            console.log("SD");//PANNING HAS ENNDED
            gotoSlideByIndex(getLandingSlideIndex(ev.velocityX * settings.swipe_sensitivity - slides.css("left").replace("px", "")));
            disable=true;
        });//WORKS!
        mc.on("swipe", function (ev) { //Hammerjs Swipe (called when mouse realsed after mouse down)


            console.log(ev.velocityX);



            /*slides.animate({
                left: "-=" + (ev.velocityX * 250)
            }, {
                duration: speed,
                easing: 'easeOutQuart' //Choose easing from easing plugin http://gsgd.co.uk/sandbox/jquery/easing/
            });*/

            gotoSlideByIndex(getLandingSlideIndex(ev.velocityX * settings.swipe_sensitivity - slides.css("left").replace("px", "")));
            console.log(slides.css("left").replace("px", ""));
            disable = true;

        }, {
            velocity: 0.000001, //minimum velocity
            threshold: 0 //Minimum distance
        });
        getLandingSlideIndex(2300);


    }

    $.fn.gotoSlide = function (i) {
        gotoSlideByIndex(i);
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

    function getLandingSlideIndex(x) {//Get slide that will be selected when silding occured
        console.log("Sup");
        for (var i = 0; i < slides.children('li').length; i++) {
            //console.log(slides.children(i).css("width").replace("px","")*i);
            if (slides.children(i).css("width").replace("px", "") * i > x /* && slides.children(i).css("width").replace("px","")*i+slides.children(i).css("width").replace("px","") < x*/ ) {

                console.log(i)
                return i;

            }

        }
        return currentIndex;
    }
    //console.log($('li:nth-child(' + (2)+ ')').css('width'));


    function gotoSlideByIndex(i) //TODO: not exactly centered - center the slide
    {
        
        changeActiveSlideTo(i);
        /*slides.css("left","+="-i*slides.children('li').css("width").replace("px",""));*/
        
        
        slides.animate({
            left: -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2)), 
            useTranslate3d:true
        }, settings.duration, 'easeOutQuart');
        //slides.css("left", -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2)));
        /*slides.css("-webkit-translate3d", -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2)));*/
        
        console.log("LEFT ::: " + slides.css('left'));
        //slides.css("left", ($("body").css("width").replace("px", "") - slides.css("left").replace("px", "") - slides.children('li').css("width").replace("px", "")) / 2);
    }

})(jQuery);
