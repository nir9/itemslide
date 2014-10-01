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
        
        slides = $(this); //Saves the object in a variable
        
        //alert("children: " + slides.length);
        /*$( this ).children( 'li.target' ).css("border", "3px double red");*/
        //alert(slides.children.length*slides.children('li').css("width").replace("px",""));
        
        console.log(slides.css("width"));
        
        slides.css("left", ($("body").css("width").replace("px","")-slides.css("left").replace("px","")-slides.children('li').css("width").replace("px",""))/2);//Centerize sliding area
        
        console.log(slides.css("left"));
        
        /*slides.css("width",slides.children.length*slides.children('li').css("width").replace("px","")*2);*/
        $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', 'active');

        var mc = new Hammer(slides.get(0)); //Retrieve DOM Elements to create hammer.js object

        mc.on("panleft panright", function (ev) {
            //            console.log(ev.velocityX +" gesture detected.");
            //overallslide = Number(slides.css("left").replace("px",""))-ev.velocityX * sensitivity;

            slides.css("left", "-="+ev.velocityX * sensitivity);
        });
        mc.on("swipe", function (ev) {
            //            console.log(ev.velocityX +" gesture detected.");
            /*accel -= ev.velocityX/100;
            while(accel>0)
            {
                console.log("YAYY");
                overallslide+=accel;
                slides.css("left",overallslide);
                accel-=0.001;
            }*/
            
            console.log(ev.velocityX);
            /*var numbervel = ev.velocityX*250;*/
            slides.transition({ x: "-="+ ev.velocityX*250}, 'ease');
            
            
            slides.animate({
                left: "-="+(ev.velocityX*250)
            }, {
                    duration: 225,
                    easing: 'swing'
                });
            
            //$(this).next();
            //slides.css("left",overallslide);
        },{
            velocity: 0.05,
            threshold: 0
            });
//asdasd
        /*overallslide += accel;
            accel-=0.01;*/

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
