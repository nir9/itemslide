//about:flags


//Dependencies - jQuery.
//Optional Dependencies - jQuery Mousewheel (~2.5KB)


(function ($) {
    "use strict";

    var isExplorer = false || !!document.documentMode; // At least IE6





    $.fn.initslide = function (options) {

        var direction = 0; //Panning Direction
        var touch;

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
            slides.css("width", slides.children('li').length * slides.children('li').width() + 10); //SET WIDTH

        //console.log("WIDTH: " + slides.css("width"));


        slides.translate3d(0);


        gotoSlideByIndex(settings.start);








        /*Swiping and panning events FROM HERE*/
        var isDown = false;
        var startPoint = 0;
        var startTime = 0;

        slides.on('mousedown touchstart', function (e) {
            if (!settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when the panning started

                if (e.type == 'touchstart') //Check for touch event or mousemove
                    touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                else
                    touch = e;


                startTime = Date.now();
                isDown = true;

                startPoint = touch.pageX;
                cancelAnimationFrame(slides.data("settings").slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended

            }
        });

        $(window).on('mousemove touchmove', function (e) { /*PAN*/




            if (!settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when the panning started
                if (isDown) {

                    if (e.type == 'touchmove') //Check for touch event or mousemove
                        touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    else
                        touch = e;

                    slides.translate3d(touch.pageX - startPoint + slides.data("settings").currentLandPos);

                }

            }

        });

        $(window).on('mouseup touchend',/*Pan End*/

            function (e) {
                if (!settings.disable_slide) {

                    if (e.type == 'touchend') //Check for touch event or mousemove
                        touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    else
                        touch = e;

                    isDown = false;



                    var value = slides.translate3d();

                    //Calculate deltaTime for calculation of velocity
                    var deltaTime = (Date.now() - startTime);
                    var velocity = -(touch.pageX - startPoint) / deltaTime;

                    if (velocity > 0) { //Set direction
                        direction = 1;
                    } else {
                        direction = -1;
                    }

                    if (!(touch.pageX - startPoint == 0)) //TO let tapping activate gotoSlide also
                        gotoSlideByIndex(getLandingSlideIndex(velocity * settings.swipe_sensitivity - value));
                }


            }
        );

        slides.on("mouseup touchend", "li", function () {//TAP EVENT
            if (isDown) {

                if ($(this).index() != slides.data("settings").currentIndex) {

                    slides.gotoSlide($(this).index());
                }
            }
        });

        /*UNTIL HERE - swiping and panning events*/







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






        //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/brandonaaron/jquery-mousewheel
        try {
            slides.mousewheel(function (event) {
                //console.log(event.deltaX, event.deltaY, event.deltaFactor);
                if (!slides.data("settings").disable_scroll) {
                    gotoSlideByIndex(slides.data("settings").currentIndex - event.deltaY);
                    event.preventDefault();
                }
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
            return -(i * slides.children('li').width() - ((slides.parent().width() - slides.data("settings").initialLeft - slides.children('li').width()) / 2));
        }



        function gotoSlideByIndex(i) {

            if (i >= slides.children('li').length || i < 0) //If exceeds boundaries dont goto slide
                return;

            changeActiveSlideTo(i);









            slides.data("settings").currentPos = slides.translate3d();

            slides.data("settings").currentLandPos = getPositionByIndex(i);





            slides.data("settings").countFrames = 0;

            slides.trigger('changeActiveItem');
            cancelAnimationFrame(slides.data("settings").slidesGlobalID);
            slides.data("settings").slidesGlobalID = requestAnimationFrame(animationRepeat);







        }




        function animationRepeat() { //Repeats using requestAnimationFrame



            slides.trigger('changePos');

            slides.data("settings").currentPos -= easeOutQuart(slides.data("settings").countFrames, 0, slides.data("settings").currentPos - slides.data("settings").currentLandPos, slides.data("settings").duration);

            //to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing
            if (slides.data("settings").currentPos == slides.data("settings").currentLandPos) {

                slides.data("settings").countFrames = 0;
                return; //out of recursion
            }






            slides.translate3d(slides.data("settings").currentPos);

            slides.data("settings").countFrames++;
            slides.data("settings").slidesGlobalID = requestAnimationFrame(animationRepeat);


        }









    } //END OF INIT


    //SET
    $.fn.gotoSlide = function (i) {
        this.trigger('gotoSlide', i);
    }

    $.fn.next = function () { //Next slide


        this.gotoSlide(this.data("settings").currentIndex + 1);


    }

    $.fn.previous = function () { //Next slide

        this.gotoSlide(this.data("settings").currentIndex - 1);
    }

    $.fn.reload = function () { //Get index of active slide
        if (!this.data("settings").disable_autowidth)
            this.css("width", this.children('li').length * this.children('li').width() + 10); //SET WIDTH

        this.gotoSlide(this.data("settings").currentIndex);

    }

    $.fn.addSlide = function (data) {
        this.append("<li>"+data+"</li>");
    }

    $.fn.removeSlide = function (index) {
        this.children(':nth-child(' + (index + 1) + ')').remove();
    }


    //GET
    $.fn.getActiveIndex = function () { //Get index of active slide
        return this.data("settings").currentIndex;
    }

    $.fn.getCurrentPos = function () { //Get current position of carousel

        return this.translate3d();
    }



    $.fn.translate3d = function (x) //Translates the x of an object or returns the x translate value
    {
        if (x == null) {
            var matrix = matrixToArray(this.css("transform"));
            return isExplorer ? parseFloat(matrix[12]) : parseFloat(matrix[4]); //Returns the x value
        } else {
            this.css('transform', 'translate3d(' + x + 'px' + ',0px, 0px)');
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

})(jQuery);
