(function ($) {
    var accel = 0;
    var overallslide = 0;
    var sensitivity = 20;
    var slides;
    var currentIndex = 0;
    //Waypoints check position relative to waypoint and decide if to scroll to or not...
    $.fn.initslide = function () {

        //var target = $(this).attr('id');
        //alert(target);
        //$(this)

        // (WIDTH of (this) - WIDTH of slide)/2
        
        slides = $(this); //Saves the object given to the plugin in a variable
        
        
        
        console.log(slides.css("width"));
        
        slides.css("left", ($("body").css("width").replace("px","")-slides.css("left").replace("px","")-slides.children('li').css("width").replace("px",""))/2);//Centerize sliding area
        
        console.log(slides.css("left"));
        
        
        $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', 'active');

        var mc = new Hammer(slides.get(0)); //Retrieve DOM Elements to create hammer.js object

        mc.on("panleft panright", function (ev) {//Hammerjs pan(drag) event happens very fast
            

            slides.css("left", "+="+ev.velocityX);//Change x of slides to velocity of drag
        });
        mc.on("swipe", function (ev) {//Hammerjs Swipe (called when mouse realsed after mouse down)
            
            
            console.log(ev.velocityX);
            
            
            
            slides.animate({
                left: "-="+(ev.velocityX*250)
            }, {
                    /*duration: 225,*/
                    easing: 'easeOutQuart'//Choose easing from easing plugin http://gsgd.co.uk/sandbox/jquery/easing/
                });
            
            
        },{
            velocity: 0.05,//minimum velocity
            threshold: 0//Minimum distance
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

})(jQuery);
