/*
This is the main code
*/
//Optional Plugins - jQuery Mousewheel (~2.5KB)


var isExplorer = false || !!document.documentMode; // At least IE6

$(function () { //document ready
    "use strict";

    $.fn.itemslide = function (options) {

            //Animation variables
            var currentPos = 0,
                slidesGlobalID = 0; //rAf id

            //Panning Variables
            var direction = 0,
                isBoundary = false, //Is current slide the first or last one
                distanceFromStart = 0;

            //True if current panning
            var vertical_pan = false,
                horizontal_pan = false;

            var slides = this; //Saves the object given to the plugin in a variable


            var defaults = { //Options
                duration: 350,
                swipe_sensitivity: 150,
                disable_slide: false,
                disable_clicktoslide: false,
                disable_scroll: false,
                start: 0,
                one_item: false, //Set true for full screen navigation or navigation with one item every time
                pan_threshold: 0.3, //Precentage of slide width
                disable_autowidth: false,
                parent_width: false,
                swipe_out: false //Enable the swipe out feature - enables swiping items out of the carousel

            };

            var settings = $.extend({}, defaults, options);


            if (settings.parent_width) {
                slides.children().width(slides.parent().outerWidth(true)); //resize the slides
            }


            var vars = {
                currentIndex: 0,
                disable_autowidth: settings.disable_autowidth,
                parent_width: settings.parent_width,
                velocity: 0,
                slideHeight: slides.children().height()
            };



            slides.end_animation = true;

            if (settings.swipe_out) //Check if enabled slideout feature
                slideout(slides, settings, vars); //Apply slideout (and transfer settings and variables)



            slides.css({ //Setting some css to avoid problems on touch devices
                'touch-action': 'pan-y',
                '-webkit-user-select': 'none',
                '-webkit-touch-callout': 'none',
                '-webkit-user-drag': 'none',
                '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
            });



            if (!settings.disable_autowidth)
                slides.css("width", slides.children('li').length * slides.children().outerWidth(true) + 10); //SET WIDTH
            //To add vertical scrolling just set width to slides.children('li').width()

            //Init


            slides.translate3d(0);


            gotoSlideByIndex(settings.start);


            /*Swiping and panning events FROM HERE*/
            var isDown = false; //Check if mouse was down before mouse up

            //Saved locations
            var startPointX = 0,
                startPointY = 0;

            var prevent = false, //TO prevent default ?
                swipeStartTime = 0,
                touch;

            //Swipe out related variables
            slides.savedSlideIndex = 0;


            slides.on('mousedown touchstart', 'li', function (e) {

                //Check for touch event or mousemove
                if (e.type == 'touchstart') {
                    touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0])); //jQuery for some reason "clones" the event.
                } else {
                    touch = e;
                }

                //If hasn't ended swipe out escape
                if (!slides.end_animation)
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


            });

            //MouseMove related variables
            var firstTime = true,
                savedStartPt = 0;


            //Some swipe out mouse move related vars
            var verticalSlideFirstTimeCount = 0; //This is used for the vertical pan if to happen once (to wrap it for later translate 3d it)


            // Called by mousemove event (inside the mousedown event)
            function mousemove(e) {
                    //Check type of event
                    if (e.type == 'touchmove') //Check for touch event or mousemove
                    {
                        touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]));

                        if (Math.abs(touch.pageX - startPointX) > 10) //If touch event than check if to start preventing default behavior
                            prevent = 1;

                        if (prevent)
                            e.preventDefault();

                    } else //Regular mousemove
                    {
                        touch = e;

                        // If disabled slide & swipe out do not prevent default to let the marking of text
                        if (!settings.disable_slide && !settings.swipe_out)
                            e.preventDefault();
                    }

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

                        if (isExplorer) //Some annoying explorer bug fix
                        {

                            slides.children().css("height", vars.slideHeight);
                        }


                        slides.savedSlide.wrapAll("<div class='itemslide_slideoutwrap' />"); //wrapAll

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

                        if (settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when horizontal panning started
                            return;
                        }

                        vertical_pan = false;

                        slides.translate3d(

                            ((firstTime == 0) ? (savedStartPt - startPointX + (touch.pageX - savedStartPt) / 4) : (touch.pageX - startPointX)) //Check if out of boundaries - if true than add springy panning effect

                            + slides.currentLandPos);

                        //Triggers pan and changePos when swiping carousel
                        slides.trigger('changePos');
                        slides.trigger('pan');

                    } else if (vertical_pan && settings.swipe_out) { //Swipe out
                        e.preventDefault();

                        $(".itemslide_slideoutwrap").translate3d(0, touch.pageY - startPointY); //Using wrapper to transform brief explanation at the top.


                        if (verticalSlideFirstTimeCount != -1) //Happen once...
                            verticalSlideFirstTimeCount = 1;
                    }

                } //End of mousemove function



            $(window).on('mouseup touchend', /*Pan End*/

                function (e) {


                    if (isDown) {

                        if (e.type == 'touchend') //Check for touch event or mousemove
                            touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]));
                        else
                            touch = e;

                        isDown = false;

                        $(window).off('mousemove touchmove'); //Stop listening for the mousemove event


                        //Check if vertical panning (swipe out) or horizontal panning (carousel swipe)
                        //Vertical PANNING
                        if (vertical_pan && settings.swipe_out) {

                            //HAPPENS WHEN SWIPEOUT

                            vertical_pan = false; //Back to false for mousewheel (Vertical pan has finished so enable mousewheel scrolling)

                            slides.swipeOut();

                            return;
                        } //Veritcal Pan
                        else if (slides.end_animation && !settings.disable_slide) { //if finished animation of sliding and swiping is not disabled

                            //Calculate deltaTime for calculation of velocity
                            var deltaTime = (Date.now() - swipeStartTime);
                            vars.velocity = -(touch.pageX - startPointX) / deltaTime;

                            if (vars.velocity > 0) { //Set direction
                                direction = 1; //PAN LEFT
                            } else {
                                direction = -1;
                            }


                            distanceFromStart = (touch.pageX - startPointX) * direction * -1; //Yaaa SOOO

                            //TAP is when deltaX is less or equal to 12px

                            if (distanceFromStart > 6) { //Check distance to see if the event is a tap

                                gotoSlideByIndex(getLandingSlideIndex(vars.velocity * settings.swipe_sensitivity - slides.translate3d().x));

                                return;
                            }
                        } //Regular horizontal pan until here


                        //TAP - click to slide
                        if (slides.savedSlide.index() != vars.currentIndex && !settings.disable_clicktoslide) { //If this occurs then its a tap
                            e.preventDefault();
                            gotoSlideByIndex(slides.savedSlide.index());
                        }
                        //TAP until here

                    }

                }
            );

            /*UNTIL HERE - swiping and panning events*/


            //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel
            try {
                slides.mousewheel(function (e) {
                    if (!settings.disable_scroll && !vertical_pan) { //Check if scroll has been disabled
                        e.preventDefault();

                        var mouseLandingIndex = vars.currentIndex - (((e.deltaX == 0 ? e.deltaY : e.deltaX) > 0) ? 1 : -1); //Outer sorthand-if is for it to goto next or prev. the inner for touchpad.

                        if (mouseLandingIndex >= slides.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
                            return; //Consider in gotoSlide

                        vars.velocity = 0; //No BOUNCE
                        gotoSlideByIndex(mouseLandingIndex);

                    }
                });
            } catch (e) {}
            //UNTILL HERE MOUSEWHEEL


            function changeActiveSlideTo(i) {
                slides.children(':nth-child(' + ((vars.currentIndex + 1) || 0) + ')').attr('class', '');

                slides.children(':nth-child(' + ((i + 1) || 0) + ')').attr('class', 'itemslide-active'); //Change destination index to active

                if (i != settings.currentIndex) //Check if landingIndex is different from currentIndex
                {
                    vars.currentIndex = i; //Set current index to landing index
                    slides.trigger('changeActiveIndex');
                }
            }

            function getLandingSlideIndex(x) { //Get slide that will be selected when silding occured - by position

                for (var i = 0; i < slides.children('li').length; i++) {

                    if (slides.children().outerWidth(true) * i + slides.children().outerWidth(true) / 2 -
                        slides.children().outerWidth(true) * settings.pan_threshold * direction - getPositionByIndex(0) > x) {

                        if (!settings.one_item)
                            return i;

                        // If one item navigation than no momentum therefore different landing slide(one forward or one backwards)
                        else {
                            if (i != vars.currentIndex)
                                return vars.currentIndex + 1 * direction; //Return 0 or more
                            else
                                return vars.currentIndex;
                        }
                    }
                }
                return settings.one_item ? vars.currentIndex + 1 : slides.children('li').length - 1; //If one item enabled than just go one slide forward and not until the end.
            }



            function getPositionByIndex(i) { //Here we shall add basic nav
                return  (-i * slides.children().outerWidth(true));
            }


            function isOutBoundariesLeft() {    //Return if user is panning out of left boundaries
                var leftBound = Math.floor(slides.translate3d().x) > (getPositionByIndex(0)) && direction == -1;
                return leftBound;
            }


            function isOutBoundariesRight() {   //Return if user is panning out of right boundaries
                var slidesCount = slides.children('li').length - 1;
                var leftMargin = parseInt(slides.first().css('padding-left'));

                var rightBound = (leftMargin + Math.ceil(slides.translate3d().x)- slides.parent().outerWidth(true)) < (getPositionByIndex(slidesCount) - slides.children('li').last().outerWidth(true)) && direction == 1;
                return rightBound;
            }


            function isOutBoundaries() { //Return if user is panning out of boundaries
                return (isOutBoundariesLeft() || isOutBoundariesRight());
            }


            function gotoSlideByIndex(i) {

                var viewportWidth = slides.parent().outerWidth(true);
                var slidesMatchesScreen = 0;
                // Slides count, that matches the screen, calculation. Performed, when slider is scrolled to the right or from the end
                $.each(Array.prototype.reverse.call(slides.children('li')), function(i, slide) {
                    viewportWidth -= slide.offsetWidth;
                    if (viewportWidth <= 0) {
                        slidesMatchesScreen = i;
                        return false;
                    }
                });
                var boundarySlideNumber = slides.children('li').length - slidesMatchesScreen;

                if (i >= boundarySlideNumber || i <= 0) //If exceeds boundaries dont goto slide
                {
                    isBoundary = true;
                    i = Math.min(Math.max(i, 0), boundarySlideNumber); //Put in between boundaries
                } else {
                    isBoundary = false;
                }


                changeActiveSlideTo(i);

                //SET DURATION

                total_duration = Math.max(settings.duration

                    - ((1920 / $(window).width()) * Math.abs(vars.velocity) *
                        9 * (settings.duration / 230) //Velocity Cut

                    )

                    - (isOutBoundaries() ? (distanceFromStart / 15) : 0) // Boundaries Spring cut
                    * (settings.duration / 230) //Relative to chosen duration

                    , 50
                ); //Minimum duration is 10

                //SET DURATION UNTILL HERE

                total_back = (isBoundary ? ((Math.abs(vars.velocity) * 250) / $(window).width()) : 0);


                currentPos = slides.translate3d().x;


                slides.currentLandPos = getPositionByIndex(i);

                //Reset


                cancelAnimationFrame(slidesGlobalID);
                startTime = Date.now();
                slidesGlobalID = requestAnimationFrame(animationRepeat);

            }

            //ANIMATION
            var total_back = 0,
                total_duration = settings.duration,
                startTime = Date.now(); //For the animation

            function animationRepeat() { //Repeats using requestAnimationFrame //For the sliding

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

            //End of init now some functions

            //Goto position without sliding animation
            slides.gotoWithoutAnimation = function (i) {
                changeActiveSlideTo(i);
                vars.currentIndex = i;
                slides.currentLandPos = getPositionByIndex(i);
                slides.translate3d(getPositionByIndex(i));
            }


            //--------------------------------------------------------------------------//


            //Some external functions (see docs)

            // SET Method
            slides.gotoSlide = function (i) {
                gotoSlideByIndex(i);
            };

            slides.next = function () {
                gotoSlideByIndex(vars.currentIndex + 1);
            };

            slides.previous = function () {
                gotoSlideByIndex(vars.currentIndex - 1);
            };

            slides.reload = function () { //Get index of active slide
                //Update some sizes
                if (vars.parent_width) {
                    this.children().width(this.parent().outerWidth(true)); //resize the slides
                }

                if (!vars.disable_autowidth) {
                    this.css("width", this.children('li').length * this.children().outerWidth(true) + 10); //SET WIDTH
                }

                vars.slideHeight = this.children().height();

                // Set panning veloicity to zero
                vars.velocity = 0;

                // w/o animation cuz its smoother
                this.gotoWithoutAnimation(vars.currentIndex);
            };

            slides.addSlide = function (data) {
                this.append("<li>" + data + "</li>");
                this.reload();
            }

            slides.removeSlide = function (index) {
                this.children(':nth-child(' + ((index + 1) || 0) + ')').remove();
                //this.reload();
            }

            // GET Methods

            //Get index of active slide
            slides.getActiveIndex = function () {
                return vars.currentIndex;
            }

            //Get current position of carousel
            slides.getCurrentPos = function () {
                return this.translate3d().x;
            }

        } //END OF INIT ($.fn.itemslide)


    //Translates the x or y of an object or returns the x translate value
    $.fn.translate3d = function (x, y) {
        if (x != null) { //Set value

            this.css('transform', 'translate3d(' + x + 'px' + ',' + (y || 0) + 'px, 0px)');


        } else { //Get value
            var matrix = matrixToArray(this.css("transform"));


            //Check if jQuery
            if ($.fn.jquery != null) { //This happens if has jQuery
                return { //Return object with x and y
                    x: (isExplorer ? parseFloat(matrix[12]) : parseFloat(matrix[4])),
                    y: (isExplorer ? parseFloat(matrix[13]) : parseFloat(matrix[5]))
                };
            } else { //This happens if has --Zepto--
                var vals = this.css('transform').replace("translate3d", "").replace("(", "").replace(")", "").replace(" ", "").replace("px", "").split(","); //Consider regex instead of tons of replaces

                return { //Return object with x and y
                    x: parseFloat(vals[0]),
                    y: parseFloat(vals[1]) //YESSS Fixed
                };
            }
        }
    }
});


//General Functions
function matrixToArray(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}

function easeOutBack(t, b, c, d, s) {
    //s - controls how forward will it go beyond goal
    if (s == undefined) s = 1.70158;

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}
