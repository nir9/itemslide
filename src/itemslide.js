//Dependencies - jQuery.
//Optional Dependencies - jQuery Mousewheel (~2.5KB)

//about:flags

/*
This is the main code
*/





(function ($) {
    "use strict";

    var isExplorer = false || !!document.documentMode; // At least IE6


    $.fn.initslide = function (options) { //Backwards compatibility (will be removed soon)
        console.log("Please do not use .initslide() as its deprecated - use .itemslide() instead");
        this.itemslide(options);
    }


    $.fn.itemslide = function (options) {

            var initialLeft = 0;



            //Animation variables
            var currentPos = 0;

            var slidesGlobalID = 0; //rAf id



            //Panning Variables
            var direction = 0; //Panning Direction
            var isBoundary = false; //Is current slide the first or last one
            var distanceFromStart = 0;

            var vertical_pan = false; //True if current panning
            var horizontal_pan = false;


            var slides = $(this); //Saves the object given to the plugin in a variable





            var defaults = { //Options
                duration: 350,
                swipe_sensitivity: 150,
                disable_slide: false,
                disable_scroll: false,
                start: 0,
                one_item: false, //Set true for full screen navigation or navigation with one item every time
                pan_threshold: 0.3, //Precentage of slide width
                disable_autowidth: false,
                swipe_out: false //Enable the swipe out feature - enables swiping items out of the carousel

            };

            var settings = $.extend({}, defaults, options);


            this.data("vars", //Variables that can be accessed publicly
                {
                    currentIndex: 0,
                    disable_autowidth: settings.disable_autowidth,
                    velocity: 0,
                    slideHeight: slides.children().height()
                });







            //var slideWidth = slides.children().width();


            slides.end_animation = true;

            if(settings.swipe_out) //Check if enabled slideout feature
                slideout(slides,settings); //Apply slideout


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
            //To add vertical scrolling just set width to slides.children('li').width()

            //console.log("WIDTH: " + slides.css("width"));


            //Init


            slides.translate3d(0);


            gotoSlideByIndex(settings.start);


            //slides.children(":gt(2)" ).css("opacity",0); - Select all elements ~except~ the first 3




            /*Swiping and panning events FROM HERE*/
            var isDown = false;


            //Saved locations
            var startPointX = 0;
            var startPointY = 0;

            var prevent = false;

            var swipeStartTime = 0;

            var touch;


            //Swipe out related variables
            slides.savedSlideIndex = 0;

            slides.on('mousedown touchstart', 'li', function (e) {

                if (!settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when the panning started


                    if (e.type == 'touchstart') //Check for touch event or mousemove
                        touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    else
                        touch = e;

                    //If hasn't ended swipe out escape
                    if(!slides.end_animation)
                        return;

                    //Reset
                    swipeStartTime = Date.now();

                    isDown = 1;

                    prevent = 0; //to know when to start prevent default

                    startPointX = touch.pageX;
                    startPointY = touch.pageY;

                    vertical_pan = false;
                    horizontal_pan = false;

                    slides.savedSlide = $(this);

                    slides.savedSlideIndex = slides.savedSlide.index();

                    //Swipe out reset
                    verticalSlideFirstTimeCount = 0;

                    //Reset until here
                    //Check this---

                    //currentPos = slides.currentLandPos;

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


            //Some swipe out mouse move related vars
            var verticalSlideFirstTimeCount = 0; //This is used for the vertical pan if to happen once (to wrap it for later translate 3d it)


            function mousemove(e) //Called by mousemove event (inside the mousedown event)
                {


                    //Check type of event
                    if (e.type == 'touchmove') //Check for touch event or mousemove
                    {
                        touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];

                        if (Math.abs(touch.pageX - startPointX) > 10) //If touch event than check if to start preventing default behavior
                            prevent = 1;

                        if (prevent)
                            e.preventDefault();

                    } else //Regular mousemove
                    {
                        touch = e;
                        e.preventDefault();
                    }






                    //Triggers
                    slides.trigger('changePos');
                    slides.trigger('pan');




                    //Set direction of panning
                    if ((-(touch.pageX - startPointX)) > 0) { //Set direction
                        direction = 1; //PAN LEFT
                    } else {
                        direction = -1;
                    }




                    //If out boundaries than set some variables to save previous location before out boundaries
                    if (isOutBoundaries()) {

                        if (firstTime) {
                            savedStartPt = touch.pageX;

                            firstTime = 0;

                        }

                    } else {

                        if (!firstTime) { //Reset Values
                            slides.currentLandPos = slides.translate3d().x;
                            startPointX = touch.pageX;
                        }

                        firstTime = 1;

                    }

                    //check if to wrap
                    if (verticalSlideFirstTimeCount == 1) //This will happen once every mousemove when vertical panning
                    {
                        slides.savedSlide.wrapAll("<div class='itemslide_slideoutwrap' />");

                        //if(isExplorer)
                        $(".itemslide_slideoutwrap").children().height(slides.data("vars").slideHeight);

                        verticalSlideFirstTimeCount = -1;
                    }



                    //Reposition according to current deltaX
                    if (Math.abs(touch.pageX - startPointX) > 6) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
                    {
                        if (!vertical_pan && slides.end_animation) //So it will stay one direction
                            horizontal_pan = true;

                        cancelAnimationFrame(slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended



                    }
                    //Is vertical panning or horizontal panning
                    if (Math.abs(touch.pageY - startPointY) > 6) //Is vertical panning
                    {
                        if (!horizontal_pan && slides.end_animation) {
                            vertical_pan = true;
                        }
                    }





                    //Reposition according to horizontal navigation or vertical navigation
                    if (horizontal_pan) {
                        vertical_pan = false;
                        slides.translate3d(

                            ((firstTime == 0) ? (savedStartPt - startPointX + (touch.pageX - savedStartPt) / 4) : (touch.pageX - startPointX)) //Check if out of boundaries - if true than add springy panning effect

                            + slides.currentLandPos);


                    } else if (vertical_pan && settings.swipe_out) {
                        e.preventDefault();

                        $(".itemslide_slideoutwrap").translate3d(0, touch.pageY - startPointY); //Using wrapper to transform brief explanation at the top.
                        //Hmm opacity
                        //slides.savedSlide.css("opacity", ((100 - Math.abs(touch.pageY - startPointY)) / 100));

                        if (verticalSlideFirstTimeCount != -1) //Happen once...
                            verticalSlideFirstTimeCount = 1;
                        //console.log("vert");
                    }









                } //End of mousemove function




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

                            $(window).off('mousemove touchmove'); //Stop listening for the mousemove event


                            //Check if vertical panning (swipe out) or horizontal panning (carousel swipe)
                            if (vertical_pan && settings.swipe_out) //Vertical PANNING
                            {


                                //swipeOutLandPos = -400; //CHANGE!!

                                slides.swipeOut();


                            } //Veritcal Pan
                            else if (slides.end_animation) {



                                //Calculate deltaTime for calculation of velocity
                                var deltaTime = (Date.now() - swipeStartTime);
                                slides.data("vars").velocity = -(touch.pageX - startPointX) / deltaTime;

                                if (slides.data("vars").velocity > 0) { //Set direction
                                    direction = 1; //PAN LEFT
                                } else {
                                    direction = -1;
                                }


                                distanceFromStart = (touch.pageX - startPointX) * direction * -1; //Yaaa SOOO






                                //TAP is when deltaX is less or equal to 12px


                                if ((touch.pageX - startPointX) * direction < 6 * (-1)) //Check distance to see if the event is a tap
                                {

                                    gotoSlideByIndex(getLandingSlideIndex(slides.data("vars").velocity * settings.swipe_sensitivity - slides.translate3d().x));
                                    //NOT HERE - remove before commit
                                } else {
                                    if (slides.savedSlide.index() != slides.data("vars").currentIndex) //TODO: SOLVE MINOR ISSUE HERE
                                    { //If this occurs then its a tap
                                        e.preventDefault(); //FIXED
                                        gotoSlideByIndex(slides.savedSlide.index());
                                    } else {

                                    }
                                }
                            } //Regular horizontal pan


                        }
                    }
                }
            );

            /*UNTIL HERE - swiping and panning events*/







            //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel
            try {
                slides.mousewheel(function (event) {

                    if (!settings.disable_scroll) {
                        slides.data("vars").velocity = 0;
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
                //console.log(slides.data("vars").currentIndex + 1);
                //            slides.children(':nth-child(' + (i + 1) + ')').attr("style", ""); //clean
                slides.children(':nth-child(' + (i + 1) + ')').attr('id', 'active'); //Change destination index to active
                //console.log((i+1));
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
                return (((Math.floor(slides.translate3d().x) > (getPositionByIndex(0)) && direction == -1) || (Math.ceil(slides.translate3d().x) < (getPositionByIndex(slides.children('li').length - 1)) && direction == 1)));
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



                //SET DURATION

                total_duration = Math.max(settings.duration

                    - ((1920 / $(window).width()) * Math.abs(slides.data("vars").velocity) *
                        9 * (settings.duration / 230) //Velocity Cut

                    )

                    - (isOutBoundaries() ? (distanceFromStart / 15) : 0) // Boundaries Spring cut
                    * (settings.duration / 230) //Relative to chosen duration

                    , 50
                ); //Minimum duration is 10

                //SET DURATION UNTILL HERE

                total_back = (isBoundary ? ((Math.abs(slides.data("vars").velocity) * 250) / $(window).width()) : 0);




                currentPos = slides.translate3d().x;

                slides.currentLandPos = getPositionByIndex(i);









                //Reset


                cancelAnimationFrame(slidesGlobalID);
                startTime = Date.now();
                slidesGlobalID = requestAnimationFrame(animationRepeat);



            }


            //ANIMATION

            var total_back = 0;
            var total_duration = settings.duration;
            var startTime = Date.now(); //For the animation

            function animationRepeat() { //Repeats using requestAnimationFrame //For the sliding


                //alert($.easing['swing'](3, 4, 2, 2, 1));


                var currentTime = Date.now() - startTime;

                slides.trigger('changePos');







                slides.translate3d(currentPos - easeOutBack(currentTime, 0, currentPos - slides.currentLandPos, total_duration, total_back));




                //to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing



                if (currentTime >= total_duration) { //Check if easing time has reached total duration
                    //Animation Ended
                    slides.translate3d(slides.currentLandPos);

                    return; //out of recursion
                }



                slidesGlobalID = requestAnimationFrame(animationRepeat);


            }




            slides.gotoWithoutAnimation = function (i)//Goto position without sliding animation
            {
                slides.data("vars").currentIndex = i;
                slides.currentLandPos = getPositionByIndex(i);
                slides.translate3d(getPositionByIndex(i));
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

        this.data("vars").slideHeight = this.children().height();

        this.data("vars").velocity = 0; //Set panning veloicity to zero
        this.gotoSlide(this.data("vars").currentIndex);

    }

    $.fn.addSlide = function (data) {
        this.append("<li>" + data + "</li>");
        this.reload();
    }

    $.fn.removeSlide = function (index) {
        this.children(':nth-child(' + (index + 1) + ')').remove();
        //this.reload();
    }


    //GET
    $.fn.getActiveIndex = function () { //Get index of active slide
        return this.data("vars").currentIndex;
    }

    $.fn.getCurrentPos = function () { //Get current position of carousel

        return this.translate3d().x;
    }



    //Translates the x or y of an object or returns the x translate value
    $.fn.translate3d = function (x, y) {
        if (x != null) { //Set value

            this.css('transform', 'translate3d(' + x + 'px' + ',' + (y || 0) + 'px, 0px)');

        } else { //Get value
            var matrix = matrixToArray(this.css("transform"));

            return { //Return object with x and y
                x: (isExplorer ? parseFloat(matrix[12]) : parseFloat(matrix[4])),
                y: (isExplorer ? parseFloat(matrix[13]) : parseFloat(matrix[5]))
            };
        }
    }







})(jQuery);


//General Functions
function matrixToArray(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}


function easeOutBack(t, b, c, d, s) {
    //s - controls how forward will it go beyond goal
    if (s == undefined) s = 1.70158;

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}
