//Dependencies - jQuery.
//Optional Dependencies - jQuery Mousewheel (~2.5KB)

//about:flags


(function ($) {
    "use strict";

    var isExplorer = false || !!document.documentMode; // At least IE6





    $.fn.initslide = function (options) {

        var direction = 0; //Panning Direction
        var isBoundary = false; //Is current slide the first or last one

        //Includes ItemSlide variables so that they will be individual to each object that is applied with itemslide.
        var defaults = {
            duration: 230,
            swipe_sensitivity: 150,
            disable_slide: false,
            disable_autowidth: false,
            disable_scroll: false,
            start: 0,
            one_item: false, //Set true for full screen navigation or navigation with one item every time
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


        slides.css({ //Setting some css to avoid problems on touch devices
            'touch-action': 'pan-y',
            '-webkit-user-select': 'none',
            '-webkit-touch-callout': 'none',
            '-webkit-user-drag': 'none',
            '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
        });

        if (!settings.disable_autowidth)
            slides.css("width", slides.children('li').length * slides.children('li').width() + 10); //SET WIDTH

        //console.log("WIDTH: " + slides.css("width"));


        slides.translate3d(0);


        gotoSlideByIndex(settings.start);







        /*Swiping and panning events FROM HERE*/
        var isDown = false;
        var startPoint = 0;
        var startTime = 0;
        var savedSlide;
        var touch;


        slides.on('mousedown touchstart', 'li', function (e) {
            if (!settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when the panning started

                if (e.type == 'touchstart') //Check for touch event or mousemove
                    touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                else
                    touch = e;


                startTime = Date.now();
                isDown = true;

                startPoint = touch.pageX;
                savedSlide = $(this);



                /*Clear Selections*/
                if (window.getSelection) { //CLEAR SELECTIONS SO IT WONT AFFECT SLIDING
                    if (window.getSelection().empty) { // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) { // Firefox
                        window.getSelection().removeAllRanges();
                    }
                } else if (document.selection) { // IE?
                    document.selection.empty();
                }
                /*Clear Selections Until Here*/



            }
        });


        $(window).on('mousemove touchmove', function (e) { /*PAN*/




            if (!settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when the panning started
                if (isDown) {
                    e.preventDefault();
                    if (e.type == 'touchmove') //Check for touch event or mousemove
                        touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    else
                        touch = e;

                    slides.trigger('changePos');

                    slides.translate3d((touch.pageX - startPoint) / (( isBoundary&&direction==( (slides.getActiveIndex()>0) ? 1 : (-1) ) ) ? 4 : 1)
                                       //The shorthand ifs are to check if on one of the boundaries and if yes than check which direction is out of range to apply 1/4 of pan.

                                       + slides.data("settings").currentLandPos);

                    console.log(isBoundary);




                    if ((-(touch.pageX - startPoint)) > 0) { //Set direction
                        direction = 1; //PAN LEFT
                    } else {
                        direction = -1;
                    }


                    if ((touch.pageX - startPoint) * direction < 12 * (-1)) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
                        cancelAnimationFrame(slides.data("settings").slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended

                }

            }

        });
        var velocity=0;

        $(window).on('mouseup touchend', /*Pan End*/

            function (e) {

                if (!settings.disable_slide) {

                    //e.preventDefault();

                    if (isDown) {

                        if (e.type == 'touchend') //Check for touch event or mousemove
                            touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        else
                            touch = e;

                        isDown = false;




                        //Calculate deltaTime for calculation of velocity
                        var deltaTime = (Date.now() - startTime);
                        velocity = -(touch.pageX - startPoint) / deltaTime;

                        if (velocity > 0) { //Set direction
                            direction = 1;
                        } else {
                            direction = -1;
                        }



                        //TAP is when deltaX is less or equal to 12px


                        if ((touch.pageX - startPoint) * direction < 6 * (-1)) //Check distance to see if the event is a tap
                        {
                            gotoSlideByIndex(getLandingSlideIndex(velocity * settings.swipe_sensitivity - slides.translate3d()));
                            //NOT HERE - remove before commit
                        } else {
                            if (savedSlide.index() != slides.data("settings").currentIndex)//TODO: SOLVE MINOR ISSUE HERE
                            {//If this occurs then its a tap
                                e.preventDefault();//FIXED
                                gotoSlideByIndex(savedSlide.index());
                            }
                        }
                    }
                }
            }
        );

        /*UNTIL HERE - swiping and panning events*/







        //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel
        try {
            slides.mousewheel(function (event) {

                if (!slides.data("settings").disable_scroll) {
                    velocity=0;
                    var mouseLandingIndex = slides.data("settings").currentIndex - event.deltaY;

                    if (mouseLandingIndex >= slides.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
                        return;

                    gotoSlideByIndex(mouseLandingIndex);

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


            slides.children(':nth-child(' + (i + 1) + ')').attr('id', 'active'); //Change destination index to active

            if (i != settings.currentIndex) //Check if landingIndex is different from currentIndex
            {
                settings.currentIndex = i; //Set current index to landing index
                slides.trigger('changeActiveItem');
            }


            // ci = i WAS HERE


        }

        function getLandingSlideIndex(x) { //Get slide that will be selected when silding occured - by position



            for (var i = 0; i < slides.children('li').length; i++) {

                if (slides.children(i).width() * i + slides.children(i).width() / 2 -

                    slides.children(i).width() * slides.data("settings").pan_threshold * direction - getPositionByIndex(0) > x) {


                    if (!settings.one_item)
                        return i;

                    else //If one item navigation than no momentum therefore different landing slide(one forward or one backwards)
                    {
                        if (i != slides.data("settings").currentIndex)
                            return slides.data("settings").currentIndex + 1 * direction //Return 0 or more
                        else
                            return slides.data("settings").currentIndex;
                    }


                }

            }

            return settings.one_item ? slides.data("settings").currentIndex + 1 : slides.children('li').length - 1; //If one item enabled than just go one slide forward and not until the end.

        }



        function getPositionByIndex(i) {
            return -(i * slides.children('li').width() - ((slides.parent().width() - slides.data("settings").initialLeft - slides.children('li').width()) / 2));
        }



        function gotoSlideByIndex(i) {



            if (i >= slides.children('li').length-1 || i <= 0) //If exceeds boundaries dont goto slide
            {
                isBoundary = true;
                i = Math.min(Math.max(i, 0), slides.children('li').length - 1); //Put in between boundaries
            }
            else
            {
                isBoundary = false;
            }


            changeActiveSlideTo(i);









            slides.data("settings").currentPos = slides.translate3d();

            slides.data("settings").currentLandPos = getPositionByIndex(i);





            slides.data("settings").countFrames = 0;


            cancelAnimationFrame(slides.data("settings").slidesGlobalID);
            slides.data("settings").slidesGlobalID = requestAnimationFrame(animationRepeat);







        }


        function animationRepeat() { //Repeats using requestAnimationFrame


            //alert($.easing['swing'](3, 4, 2, 2, 1));




            slides.trigger('changePos');

            slides.data("settings").currentPos -= easeOutQuart(slides.data("settings").countFrames, 0, slides.data("settings").currentPos - slides.data("settings").currentLandPos,
                                                               //Duration Part
                                                               Math.max(
                                                               slides.data("settings").duration
                                                              -((1920/$(window).width())*Math.abs(velocity)*
                                                                7*(slides.data("settings").duration/230)
                                                               ),10)//Minimum duration is 10


                                                              );

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
        this.append("<li>" + data + "</li>");
        this.reload();
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
