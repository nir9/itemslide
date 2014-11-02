//Vendor prefixes - ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ]
//about:flags


//Dependencies - jQuery, Hammer.js.
//Optional Dependencies - Hammer.js jQuery Extension (~0.5KB) , jQuery Mousewheel (~2.5KB)


(function ($) {
    "use strict";

    var isExplorer = false;


    isExplorer = msieversion(); //Check if browser is ie




    //Waypoints check position relative to waypoint and decide if to scroll to or not...
    $.fn.initslide = function (options) {

        var direction = 0; //Panning Direction


        //Includes ItemSlide variables so that they will be individual to each object that is applied with itemslide.
        var defaults = {
            duration: 250,
            swipe_sensitivity: 250,
            disable_slide: false,
            disable_autowidth: false,
            disable_scroll: false,
            start: 0,
            pan_threshold: 0.3, //Precentage of slide width
            //Until here options

            currentIndex: 0,
            currentPos: 0,
            begin: 0,
            targetFrame: 0,
            countFrames: 0,
            currentLandPos: 0,
            initialLeft: 0,
            slidesGlobalID: 0


        };

        var settings = $.extend({}, defaults, options);


        this.data("settings", settings);


        var slides = $(this); //Saves the object given to the plugin in a variable

        slides.data("settings").initialLeft = parseInt(slides.css("left").replace("px", ""));



        if (!settings.disable_autowidth)
            slides.css("width", slides.children('li').length * slides.children('li').css("width").replace("px", "") + 10); //SET WIDTH

        //console.log("WIDTH: " + slides.css("width"));

        slides.css('transform', 'translate3d(0px, 0px, 0px)'); // transform according to vendor prefix

        /*slides.css({
				WebkitTransform: 'translate3d(' + (ev.deltaX + currentLandPos) + 'px' + ',0px, 0px)'
				//msTransform
			});*/

        gotoSlideByIndex(settings.start);




        var mc = new Hammer(slides.get(0)); //Retrieve DOM Elements to create hammer.js object




        mc.on("panleft panright", function (ev) { //Hammerjs pan(drag) event happens very fast




            if (ev.type == "panleft") {
                direction = 1;
            } else {
                direction = -1;
            }


            if (!settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when the panning started
                slides.css('transform', 'translate3d(' + (ev.deltaX + slides.data("settings").currentLandPos) + 'px' + ',0px, 0px)'); // transform according to vendor prefix
                slides.trigger('pan');
                slides.trigger('changePos');
                cancelAnimationFrame(slides.data("settings").slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning
            }

        });
        mc.on("panend", function (ev) {
            if (!settings.disable_slide) {

                var matrix = matrixToArray(slides.css("transform")); //prefix
                var value;
                if (!isExplorer) { //YES in explorer its different :)
                    value = parseFloat(matrix[4]);
                } else {
                    value = parseFloat(matrix[12]);
                }


                gotoSlideByIndex(getLandingSlideIndex(ev.velocityX * settings.swipe_sensitivity - value));

            }
        }); //WORKS!




        slides.children('li').mousedown(function (e) {
            if (window.getSelection) { //CLEAR SELECTIONS SO IT WONT AFFECT SLIDING
                if (window.getSelection().empty) { // Chrome
                    window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) { // Firefox
                    window.getSelection().removeAllRanges();
                }
            } else if (document.selection) { // IE?
                document.selection.empty();
            }
        });



        slides.tapEvent(); //ADD TAP EVENT


        //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/brandonaaron/jquery-mousewheel
        try {
            slides.mousewheel(function (event) {
                //console.log(event.deltaX, event.deltaY, event.deltaFactor);
                if (!slides.data("settings").disable_scroll)
                    gotoSlideByIndex(slides.data("settings").currentIndex - event.deltaY);
            });
        } catch (e) {}
        //UNTILL HERE MOUSEWHEEL


        slides.on('gotoSlide', function (e, i) //triggered when object method is called
            {
                gotoSlideByIndex(i);
            });








        function changeActiveSlideTo(i) {

            slides.children(':nth-child(' + (slides.data("settings").currentIndex + 1) + ')').attr('id', ''); //WORKS!!


            settings.currentIndex = i;

            //console.log("new index: " + slides.data("settings").currentIndex);

            slides.children(':nth-child(' + (slides.data("settings").currentIndex + 1) + ')').attr('id', 'active');


        }

        function getLandingSlideIndex(x) { //Get slide that will be selected when silding occured - by position



            for (var i = 0; i < slides.children('li').length; i++) {

                if (slides.children(i).width() * i + slides.children(i).width() / 2 -

                    slides.children(i).width() * slides.data("settings").pan_threshold * direction - getPositionByIndex(0) > x) {

                    return i;

                }

            }

            return slides.children('li').length - 1;
        }



        function getPositionByIndex(i) {
            return -(i * slides.children('li').css("width").replace("px", "") - ((slides.parent().css("width").replace("px", "") - slides.data("settings").initialLeft - slides.children('li').css("width").replace("px", "")) / 2));
        }



        function gotoSlideByIndex(i) {

            if (i >= slides.children('li').length || i < 0) //If exceeds boundaries dont goto slide
                return;

            changeActiveSlideTo(i);









            var matrix = matrixToArray(slides.css("transform"));
            var value;
            if (!isExplorer) {
                value = parseFloat(matrix[4]);
            } else { //IE 11 - transform x is in a different position
                value = parseFloat(matrix[12]);
            }


            slides.data("settings").currentPos = value;

            slides.data("settings").currentLandPos = getPositionByIndex(i);


            //console.log(slides.data("settings").currentLandPos + "ccc");





            slides.data("settings").countFrames = 0;

            slides.trigger('changeActiveItem');
            cancelAnimationFrame(slides.data("settings").slidesGlobalID);
            slides.data("settings").slidesGlobalID = requestAnimationFrame(animationRepeat);







        }




        function animationRepeat() {



            slides.trigger('changePos');

            slides.data("settings").currentPos -= easeOutQuart(slides.data("settings").countFrames, 0, slides.data("settings").currentPos - slides.data("settings").currentLandPos, slides.data("settings").duration); //work!!
            //to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing
            if (slides.data("settings").currentPos == slides.data("settings").currentLandPos) {

                slides.data("settings").countFrames = 0;
                return; //out of recursion
            }





            slides.css('transform', 'translate3d(' + (slides.data("settings").currentPos) + 'px' + ',0px, 0px)'); // transform according to vendor prefix

            //slides.css('left', (slides.data("settings").currentPos) ); // transform according to vendor prefix
            slides.data("settings").countFrames++;
            slides.data("settings").slidesGlobalID = requestAnimationFrame(animationRepeat);


        }









    } //END OF INIT


    //SET
    $.fn.gotoSlide = function (i) {
        this.trigger('gotoSlide', i);
    }

    $.fn.next = function () { //Next slide
        //gotoSlideByIndex(this.data("settings").this.data("settings").currentIndex + 1);

        this.gotoSlide(this.data("settings").currentIndex + 1);

        //this.data("settings",settings);
    }

    $.fn.previous = function () { //Next slide

        this.gotoSlide(this.data("settings").currentIndex - 1);
    }

    $.fn.reload = function () { //Get index of active slide
        if (!this.data("settings").disable_autowidth)
            this.css("width", this.children('li').length * this.children('li').width() + 10); //SET WIDTH

        this.gotoSlide(this.data("settings").currentIndex);
        //console.log(this.data("settings").currentIndex);//TESTING
    }

    $.fn.add = function (data) {
        this.append(data);
        this.tapEvent();
    }


    //GET
    $.fn.getActiveIndex = function () { //Get index of active slide
        return this.data("settings").currentIndex;
    }

    $.fn.getCurrentPos = function () { //Get current position of carousel
        var matrix = matrixToArray(this.css("transform"));
        var value;
        if (!isExplorer) {
            value = parseFloat(matrix[4]);
        } else { //IE 11 - transform x is in a different position
            value = parseFloat(matrix[12]);
        }
        return value;
    }








    $.fn.tapEvent = function () //Activate tap event on current slides
    {
        var slides = this;
        try { //If someone forgot/didn't know that you need the hammer jquery plugin
            slides.children('li').hammer().bind("tap", function (e) {
                if ($(this).index() != slides.data("settings").currentIndex) {
                    slides.gotoSlide($(this).index());
                }
            });
        } catch (e) {
            //optional
        }
    }





    function matrixToArray(matrix) {
        return matrix.substr(7, matrix.length - 8).split(', ');
    }

    function easeOutQuart(t, b, c, d) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    }

    function msieversion() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer, return version number
            return true;
        else // If another browser, return 0
            return false;

    }

})(jQuery);
