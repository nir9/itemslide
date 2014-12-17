//Dependencies - jQuery.
//Optional Dependencies - jQuery Mousewheel (~2.5KB)

//about:flags


(function ($) {
    "use strict";

    var isExplorer = false || !!document.documentMode; // At least IE6





    $.fn.initslide = function (options) {

        var initialLeft = 0;

        //Animation variables
        var countFrames = 0;
        var currentPos = 0;
        var currentLandPos = 0;
        var slidesGlobalID = 0; //rAf id


        var direction = 0; //Panning Direction
        var isBoundary = false; //Is current slide the first or last one
        var distanceFromStart = 0;



        var defaults = { //Options
            duration: 200,
            swipe_sensitivity: 150,
            disable_slide: false,
            disable_scroll: false,
            start: 0,
            one_item: false, //Set true for full screen navigation or navigation with one item every time
            pan_threshold: 0.3, //Precentage of slide width
            disable_autowidth: false

        };

        var settings = $.extend({}, defaults, options);


        this.data("vars", //Variables that can be accessed publicly
            {
                currentIndex: 0,
                disable_autowidth: settings.disable_autowidth
            });




        var slides = $(this); //Saves the object given to the plugin in a variable

        initialLeft = parseInt(slides.css("left").replace("px", ""));


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
        var prevent = false;

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

                isDown = 1;

                prevent = 0; //to know when to start prevent default

                startPoint = touch.pageX;

                savedSlide = $(this);





                //Turn on mousemove event when mousedown

                $(window).on('mousemove touchmove', mousemove); //When mousedown start the handler for mousemove event




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

        //MouseMove related variables
        var firstTime = true;
        var savedStartPt = 0;


        function mousemove(e) //Called by mousemove event (inside the mousedown event)
        {


            //Check type of event
            if (e.type == 'touchmove') //Check for touch event or mousemove
            {
                touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];

                if (Math.abs(touch.pageX - startPoint) > 10) //If touch event than check if to start preventing default behavior
                    prevent = 1;

                if (prevent)
                    e.preventDefault();

            }
            else //Regular mousemove
            {
                touch = e;
                e.preventDefault();
            }







            //Triggers
            slides.trigger('changePos');
            slides.trigger('pan');




            //Set direction of panning
            if ((-(touch.pageX - startPoint)) > 0) { //Set direction
                direction = 1; //PAN LEFT
            } else {
                direction = -1;
            }




            //If out boundaries than set some variables to save previous location before out boundaries
            if(isOutBoundaries())
            {

                if(firstTime){
                    savedStartPt = touch.pageX;

                    firstTime = 0;
                    console.log("Entered: " + slides.translate3d());

                }

            }
            else{

                if(!firstTime){//Reset Values
                    currentLandPos = slides.translate3d();
                    startPoint=touch.pageX;
                }

                firstTime = 1;

            }

            //Reposition according to current deltaX
            slides.translate3d(

                    ((firstTime==0) ? (savedStartPt-startPoint + (touch.pageX - savedStartPt) / 4) : (touch.pageX - startPoint) ) //Check if out of boundaries - if true than add springy panning effect

                                   + currentLandPos);







            if ((touch.pageX - startPoint) * direction < 12 * (-1)) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
                cancelAnimationFrame(slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended
        }


        var velocity = 0;

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
                            direction = 1; //PAN LEFT
                        } else {
                            direction = -1;
                        }


                        distanceFromStart = (touch.pageX - startPoint) * direction * -1;



                        $(window).off('mousemove touchmove'); //Stop listening for the mousemove event

                        //TAP is when deltaX is less or equal to 12px


                        if ((touch.pageX - startPoint) * direction < 6 * (-1)) //Check distance to see if the event is a tap
                        {
                            gotoSlideByIndex(getLandingSlideIndex(velocity * settings.swipe_sensitivity - slides.translate3d()));
                            //NOT HERE - remove before commit
                        } else {
                            if (savedSlide.index() != slides.data("vars").currentIndex) //TODO: SOLVE MINOR ISSUE HERE
                            { //If this occurs then its a tap
                                e.preventDefault(); //FIXED
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

                if (!settings.disable_scroll) {
                    velocity = 0;
                    var mouseLandingIndex = slides.data("vars").currentIndex - event.deltaY;

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




            slides.children(':nth-child(' + (slides.data("vars").currentIndex + 1) + ')').attr('id', ''); //WORKS!!


            slides.children(':nth-child(' + (i + 1) + ')').attr('id', 'active'); //Change destination index to active

            if (i != settings.currentIndex) //Check if landingIndex is different from currentIndex
            {
                slides.data("vars").currentIndex = i; //Set current index to landing index
                slides.trigger('changeActiveIndex');
            }


            // ci = i WAS HERE


        }

        function getLandingSlideIndex(x) { //Get slide that will be selected when silding occured - by position

            for (var i = 0; i < slides.children('li').length; i++) {

                if (slides.children(i).width() * i + slides.children(i).width() / 2 -

                    slides.children(i).width() * settings.pan_threshold * direction - getPositionByIndex(0) > x) {


                    if (!settings.one_item)
                        return i;

                    else //If one item navigation than no momentum therefore different landing slide(one forward or one backwards)
                    {
                        if (i != slides.data("vars").currentIndex)
                            return slides.data("vars").currentIndex + 1 * direction //Return 0 or more
                        else
                            return slides.data("vars").currentIndex;
                    }


                }

            }

            return settings.one_item ? slides.data("vars").currentIndex + 1 : slides.children('li').length - 1; //If one item enabled than just go one slide forward and not until the end.

        }



        function getPositionByIndex(i) {
            return -(i * slides.children('li').width() - ((slides.parent().width() - initialLeft - slides.children('li').width()) / 2));
        }


        function isOutBoundaries() { //Return if user is panning out of boundaries
            return (((Math.floor(slides.translate3d())>(getPositionByIndex(0)) && direction == -1 )||(Math.ceil(slides.translate3d())<(getPositionByIndex(slides.children('li').length - 1)) && direction == 1 )));
        }

        function gotoSlideByIndex(i) {



            if (i >= slides.children('li').length - 1 || i <= 0) //If exceeds boundaries dont goto slide
            {
                isBoundary = true;
                i = Math.min(Math.max(i, 0), slides.children('li').length - 1); //Put in between boundaries
            } else {
                isBoundary = false;
            }


            changeActiveSlideTo(i);









            currentPos = slides.translate3d();

            currentLandPos = getPositionByIndex(i);





            countFrames = 0;


            //SET DURATION

            total_duration = Math.max(settings.duration

                - ((1920 / $(window).width()) * Math.abs(velocity) *
                    7 * (settings.duration / 230) //Velocity Cut

                )

                - (isOutBoundaries() ? (distanceFromStart / 15) : 0) // Boundaries Spring cut
                * (settings.duration / 230) //Relative to chosen duration

                , 10
            ); //Minimum duration is 10

            //SET DURATION UNTILL HERE


            cancelAnimationFrame(slidesGlobalID);
            slidesGlobalID = requestAnimationFrame(animationRepeat);









        }

        var total_duration = settings.duration;

        function animationRepeat() { //Repeats using requestAnimationFrame


            //alert($.easing['swing'](3, 4, 2, 2, 1));




            slides.trigger('changePos');


            currentPos -= easeOutQuart(countFrames, 0, currentPos - currentLandPos, total_duration);



            //to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing

            if (Math.round(currentPos) == currentLandPos) {

                countFrames = 0;
                return; //out of recursion
            }






            slides.translate3d(currentPos);


            countFrames++;
            slidesGlobalID = requestAnimationFrame(animationRepeat);


        }









    } //END OF INIT


    //SET
    $.fn.gotoSlide = function (i) {
        this.trigger('gotoSlide', i);
    }

    $.fn.next = function () { //Next slide


        this.gotoSlide(this.data("vars").currentIndex + 1);


    }

    $.fn.previous = function () { //Next slide

        this.gotoSlide(this.data("vars").currentIndex - 1);
    }

    $.fn.reload = function () { //Get index of active slide
        if (!this.data("vars").disable_autowidth)
            this.css("width", this.children('li').length * this.children('li').width() + 10); //SET WIDTH

        this.gotoSlide(this.data("vars").currentIndex);

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
        return this.data("vars").currentIndex;
    }

    $.fn.getCurrentPos = function () { //Get current position of carousel

        return this.translate3d();
    }



    $.fn.translate3d = function (x) //Translates the x of an object or returns the x translate value
    {
        if (x != null) {
            this.css('transform', 'translate3d(' + x + 'px' + ',0px, 0px)');
        } else {
            var matrix = matrixToArray(this.css("transform"));
            return isExplorer ? parseFloat(matrix[12]) : parseFloat(matrix[4]); //Returns the x value
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
