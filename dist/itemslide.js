(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Animations = function(carousel) {

    // Private variables
    var _this = this,
        vars = carousel.vars,
        options = carousel.options,
        slides = carousel.$el;


    var total_duration, total_back, currentPos, startTime;
    // Public functions
    _this.gotoSlideByIndex = function (i , without_animation) {

        var isBoundary;

        // Put destination index between boundaries
        if (i >= slides.children().length - 1 || i <= 0) {
            isBoundary = true;
            i = Math.min(Math.max(i, 0), slides.children().length - 1); //Put in between boundaries
        }
        else {
            isBoundary = false;
        }

        changeActiveSlideTo(i);

        //SET DURATION
        //Minimum duration is 10
        total_duration = Math.max(options.duration
            - ((1920 / $(window).width()) * Math.abs(vars.velocity) *
                9 * (options.duration / 230) //Velocity Cut
            )

            - (_this.isOutBoundaries() ? (vars.distanceFromStart / 15) : 0) // Boundaries Spring cut
            * (options.duration / 230) //Relative to chosen duration

            , 50
        );
        //console.log(var.duration)
        //SET DURATION UNTILL HERE

        total_back = (isBoundary ? ((Math.abs(vars.velocity) * 250) / $(window).width()) : 0);
        currentPos = slides.translate3d().x;
        _this.currentLandPos = getPositionByIndex(i);

        if(without_animation) {
            //Goto position without sliding animation
            slides.translate3d(getPositionByIndex(i));
            // In this case just change position and get out of the function so the animation won't start
            return;
        }

        //Reset
        window.cancelAnimationFrame(_this.slidesGlobalID);

        startTime = Date.now();
        _this.slidesGlobalID = window.requestAnimationFrame(animationRepeat);
    };

    _this.getLandingSlideIndex = function (x) {
        //Get slide that will be selected when silding occured - by position

        for (var i = 0; i < slides.children().length; i++) {

            if (slides.children().outerWidth(true) * i + slides.children().outerWidth(true) / 2 -
                slides.children().outerWidth(true) * options.pan_threshold * vars.direction - getPositionByIndex(0) > x) {

                if (!options.one_item)
                    return i;

                // If one item navigation than no momentum therefore different landing slide(one forward or one backwards)
                else {
                    if (i != vars.currentIndex)
                        return vars.currentIndex + vars.direction; //Return 0 or more
                    else
                        return vars.currentIndex;
                }
            }
        }
        return options.one_item ? vars.currentIndex + 1 : slides.children().length - 1; //If one item enabled than just go one slide forward and not until the end.
    };

    _this.isOutBoundaries = function () { //Return if user is panning out of boundaries
        return (Math.floor(slides.translate3d().x) > (getPositionByIndex(0)) && vars.direction == -1) ||
                 (Math.ceil(slides.translate3d().x) < (getPositionByIndex(slides.children().length - 1)) && vars.direction == 1); //CHANGED HERE
    };


    // Private functions
    function changeActiveSlideTo (i) {
        slides.children(':nth-child(' + ((vars.currentIndex + 1) || 0) + ')').removeClass('itemslide-active');

        slides.children(':nth-child(' + ((i + 1) || 0) + ')').addClass('itemslide-active'); //Change destination index to active

        //Check if landingIndex is different from currentIndex
        if (i != options.currentIndex) {
            vars.currentIndex = i; //Set current index to landing index
            slides.trigger('changeActiveIndex');
        }
    }

    function getPositionByIndex (i) {
        return -(i * slides.children().outerWidth(true) - ((slides.parent().outerWidth(true) - slides.children().outerWidth(true)) / (options.left_sided ? 1 : 2)))  // Changed Here!
    }

    function animationRepeat() {
        var currentTime = Date.now() - startTime;

        if (options.left_sided) {
        	_this.currentLandPos = clamp( -(vars.allSlidesWidth - slides.parent().width()), 0, _this.currentLandPos);
        }

        slides.trigger('changePos');

        slides.translate3d(currentPos - easeOutBack(currentTime, 0, currentPos - _this.currentLandPos, total_duration, total_back));

        // to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing

        if (currentTime >= total_duration) { //Check if easing time has reached total duration
            //Animation Ended
            slides.translate3d(_this.currentLandPos);
            return; //out of recursion
        }

        // yupp
        _this.slidesGlobalID = requestAnimationFrame(animationRepeat);

    }


};
// Export object
module.exports = Animations;

//General Functions
global.matrixToArray = function(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
};

global.easeOutBack = function(t, b, c, d, s) {
    //s - controls how forward will it go beyond goal
    if (s == undefined) s = 1.70158;

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};

// Function to access t3d
$.fn.translate3d = function (x, y) {
    if (x != null) { //Set value
        this.css('transform', 'translate3d(' + x + 'px' + ',' + (y || 0) + 'px, 0px)');
    } else { //Get value
        var matrix = matrixToArray(this.css("transform"));

        //Check if jQuery
        if ($.fn.jquery != null) {
            return { //Return object with x and y
                x: (isExplorer ? parseFloat(matrix[12]) : parseFloat(matrix[4])),
                y: (isExplorer ? parseFloat(matrix[13]) : parseFloat(matrix[5]))
            };
        }
        else {
            // Zepto
            var vals = this.css('transform').replace("translate3d", "").replace("(", "").replace(")", "").replace(" ", "").replace("px", "").split(","); //Consider regex instead of tons of replaces

            return { //Return object with x and y
                x: parseFloat(vals[0]),
                y: parseFloat(vals[1])
            };
        }
    }
};

global.clamp = function (min, max, value) {
	  return Math.min(Math.max(value, min), max);
};

global.getCurrentTotalWidth = function (inSlides) { // Returns the total number of pixels for each items
	var width = 0;
	inSlides.children().each(function() {
	    width += $(this).outerWidth( true );
	});
	return width;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
var Navigation = require("./navigation"),
    Animations = require("./animation"),
    slideout = require("./slideout"),
    mousewheel = require("./mousewheel");

module.exports = {
    create: function (options, element) {
        // Create a new carousel
        var _this = this;

        _this.$el = element;
        _this.options = options;

        if (_this.options.parent_width) {
            element.children().width(element.parent().outerWidth(true)); //resize the slides
        }

        //Setting some css to avoid problems on touch devices
        element.css({
            'touch-action': 'pan-y',
            '-webkit-user-select': 'none',
            '-webkit-touch-callout': 'none',
            '-webkit-user-drag': 'none',
            '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
        });

        if (!_this.options.disable_autowidth) {
            element.css("width", element.children('li').length * element.children().outerWidth(true) + 10); //SET WIDTH
        }
        //Note: To add vertical scrolling just set width to slides.children('li').width()

        _this.vars = {
            currentIndex: 0,
            parent_width: _this.options.parent_width,
            velocity: 0,
            slideHeight: element.children().height(),
            direction: 1,
            allSlidesWidth: getCurrentTotalWidth(element)
        };

        element.end_animation = true;

        //Check if enabled slideout feature
        if (_this.options.swipe_out) {
            slideout.slideout(_this); //Apply slideout (and transfer settings and variables)
        }
        // Init modules
        var anim = new Animations(_this); // Stuff like gotoslide and the sliding animation
        var nav = new Navigation(_this, anim); // Add navigation like swiping and panning to the carousel

        // Give external access
        _this.anim = anim;
        _this.nav = nav;

        element.translate3d(0);
        anim.gotoSlideByIndex(_this.options.start);

        //Check if scroll has been enabled
        if (!_this.options.disable_scroll) {
            try {
                // Add mousewheel sliding to carousel
                mousewheel.add(_this, anim, nav, element);
            } catch(e) {}
        }
    }
};

},{"./animation":1,"./mousewheel":5,"./navigation":6,"./slideout":8}],3:[function(require,module,exports){
// Basically adds all external methods to the object
module.exports = {
    apply: function (slides, carousel) {  // slides = jQuery object of carousel, carousel = ItemSlide object with the internal functions

        slides.gotoSlide = function (i) {
            carousel.anim.gotoSlideByIndex(i);
        };

        slides.next = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex + 1);
        };

        slides.previous = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex - 1);
        };

        slides.reload = function () { //Get index of active slide
            var $el = carousel.$el;
            var vars = carousel.vars;

            //Update some sizes
            if (vars.parent_width) {
                $el.children().width($el.parent().outerWidth(true)); //resize the slides
            }

            if (!carousel.options.disable_autowidth) {
                $el.css("width", $el.children('li').length * $el.children().outerWidth(true) + 10); //SET WIDTH
            }

            vars.slideHeight = $el.children().height();

            vars.allSlidesWidth = getCurrentTotalWidth($el);
            // Set panning veloicity to zero
            vars.velocity = 0;
            // w/o animation cuz its smoother

            slides.gotoSlide(vars.currentIndex);
        };

        slides.addSlide = function (data) {
            slides.append("<li>" + data + "</li>");

            // Refresh events
            carousel.nav.createEvents();

            slides.reload();
        };

        slides.removeSlide = function (index) {
            carousel.$el.children(':nth-child(' + ((index + 1) || 0) + ')').remove();
            carousel.vars.allSlidesWidth = getCurrentTotalWidth(carousel.$el);
        };

        // GET Methods

        //Get index of active slide
        slides.getActiveIndex = function () {
            return carousel.vars.currentIndex;
        };

        //Get current position of carousel
        slides.getCurrentPos = function () {
            return slides.translate3d().x;
        };

        // Get index of a slide given a position on carousel
        slides.getIndexByPosition = function(x) {
            return carousel.anim.getLandingSlideIndex(-x);
        };
    }
};

},{}],4:[function(require,module,exports){
(function (global){
// Main
"use strict";

global.isExplorer = !!document.documentMode; // At least IE6


require("./polyfills");
var Carousel = require("./carousel");
var externalFuncs = require("./external_funcs");

var defaults = {
    duration: 350,
    swipe_sensitivity: 150,
    disable_slide: false,
    disable_clicktoslide: false,
    disable_scroll: false,
    start: 0,
    one_item: false, //Set true for "one slide per swipe" navigation (used in the full screen navigation example)
    pan_threshold: 0.3, //Precentage of slide width
    disable_autowidth: false,
    parent_width: false,
    swipe_out: false, //Enable the swipe out feature - enables swiping items out of the carousel
    left_sided: false, // Restricts the movements to the borders instead of the middle
    infinite: false
};

// Extend jQuery with the itemslide function
$.fn.itemslide = function (options) {
    var carousel = $.extend(true, {}, Carousel);
    // Add external functions to element
    externalFuncs.apply(this, carousel);

    // And finally create the carousel
    carousel.create($.extend(defaults, options), this);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./carousel":2,"./external_funcs":3,"./polyfills":7}],5:[function(require,module,exports){
// Add mousewheel capability to carousel
// IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel

module.exports = {
    add: function (_this, anim, nav, slides) {
        // Add a mousewheel listener to carousel
        var touchCounter = 0,
            sensetivity = 4; // Less is more (for the touchpad)

        slides.mousewheel(function (e) {
            // Check if vertical pan is occuring... (if occuring dont continue)
            if (!nav.get_vertical_pan()) {

                var isWheel = (e.deltaFactor >= 100 || e.deltaFactor % 1 == 0); // Checked on Chrome, Firefox and Edge

                if (!isWheel) {
                    // different behavior for touchpad...
                    touchCounter++;

                    if (touchCounter == sensetivity) {
                        touchCounter = 0;
                        return;
                    }
                }


                e.preventDefault();
                //Outer sorthand-if is for it to goto next or prev. the inner for touchpad.
                var mouseLandingIndex = _this.vars.currentIndex - (((e.deltaX == 0 ? e.deltaY : e.deltaX) > 0) ? 1 : -1);

                if (mouseLandingIndex >= slides.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
                    return; //Consider in gotoSlide

                _this.vars.velocity = 0; //No BOUNCE

                anim.gotoSlideByIndex(mouseLandingIndex);
            }
        });
    }
};

},{}],6:[function(require,module,exports){
// All things navigation - touch navigation and mouse
var Navigation = function (carousel, anim) {
    var $el = carousel.$el,
        options = carousel.options,
        vars = carousel.vars,
        swipeOut = carousel.swipeOut;


    this.createEvents = function () {
        // Start navigation listeners
        $el.children().on('mousedown touchstart', function (e) {
            touchstart.call(this, e);
        });
        $(window).on('mouseup touchend', function (e) {
            touchend(e);
        });
    };

    this.createEvents();




    // And the navigation functions

    // Navigation Variables
    var swipeStartTime, isDown, prevent, startPointX, startPointY, vertical_pan = false,
        horizontal_pan;

    // Swipe out Variables
    var verticalSlideFirstTimeCount;

    // Getter for vertical_pan
    this.get_vertical_pan = function () {
        return vertical_pan
    };

    function touchstart(e) {
        // no-drag feature
        if ($(e.target).attr('no-drag') === 'true' || !$el.end_animation) {
            //Or if hasn't ended swipe out escape
            return;
        }

        var touch;

        //Check for touch event or mousemove
        if (e.type == 'touchstart') {
            touch = getTouch(e);
        } else {
            touch = e;
        }


        //Reset
        swipeStartTime = Date.now();

        isDown = 1;

        prevent = 0; //to know when to start prevent default

        startPointX = touch.pageX;
        startPointY = touch.pageY;

        vertical_pan = false;
        horizontal_pan = false;

        $el.savedSlide = $(this); // Get the slide that has been pressed

        $el.savedSlideIndex = $el.savedSlide.index();

        //Swipe out reset
        verticalSlideFirstTimeCount = 0;
        //Reset until here


        //Turn on mousemove event when mousedown
        $(window).on('mousemove touchmove', function (e) {
            mousemove(e)
        }); //When mousedown start the handler for mousemove event

        // Clear selections so they wont affect sliding
        clearSelections();

    }

    //mousemove vars
    var savedStartPt, firstTime;

    function mousemove(e) {

        var touch;
        //Check type of event
        //Check if touch event or mousemove

        if (e.type == 'touchmove') {
            touch = getTouch(e);

            if (Math.abs(touch.pageX - startPointX) > 10) //If touch event than check if to start preventing default behavior
                prevent = 1;

            if (prevent)
                e.preventDefault();

        } else //Regular mousemove
        {
            touch = e;

            // If disabled slide & swipe out do not prevent default to let the marking of text
            if (!options.disable_slide && !options.swipe_out)
                e.preventDefault();
        }

        //Set direction of panning
        if ((-(touch.pageX - startPointX)) > 0) { //Set direction
            vars.direction = 1; //PAN LEFT
        } else {
            vars.direction = -1;
        }

        //If out boundaries than set some variables to save previous location before out boundaries
        if (anim.isOutBoundaries()) {
            if (firstTime) {
                savedStartPt = touch.pageX;

                firstTime = 0;
            }

        } else {

            if (!firstTime) { //Reset Values
                anim.currentLandPos = $el.translate3d().x;
                startPointX = touch.pageX;
            }

            firstTime = 1;

        }

        //check if to wrap
        if (verticalSlideFirstTimeCount == 1) //This will happen once every mousemove when vertical panning
        {
            // Fixing a minor issue on ie and edge
            $el.children().css("height", vars.slideHeight);

            $el.savedSlide.wrapAll("<div class='itemslide_slideoutwrap' />"); //wrapAll

            verticalSlideFirstTimeCount = -1;
        }

        //Reposition according to current deltaX
        if (Math.abs(touch.pageX - startPointX) > 6) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
        {
            if (!vertical_pan && $el.end_animation) //So it will stay one direction
                horizontal_pan = true;

            window.cancelAnimationFrame(anim.slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended

        }
        //Is vertical panning or horizontal panning
        if (Math.abs(touch.pageY - startPointY) > 6) //Is vertical panning
        {
            if (!horizontal_pan && $el.end_animation) {
                vertical_pan = true;
            }
        }


        //Reposition according to horizontal navigation or vertical navigation
        if (horizontal_pan) {

            if (options.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when horizontal panning started
                return;
            }

            if (options.left_sided) {
                anim.currentLandPos = clamp(-(vars.allSlidesWidth - $el.parent().width()), 0, anim.currentLandPos);
            }

            vertical_pan = false;

            $el.translate3d(
                ((firstTime == 0) ? (savedStartPt - startPointX + (touch.pageX - savedStartPt) / 4) : (touch.pageX - startPointX)) //Check if out of boundaries - if true than add springy panning effect

                + anim.currentLandPos);

            //Triggers pan and changePos when swiping carousel
            $el.trigger('changePos');
            $el.trigger('pan');

        } else if (vertical_pan && options.swipe_out) { //Swipe out
            e.preventDefault();

            $(".itemslide_slideoutwrap").translate3d(0, touch.pageY - startPointY); //Using wrapper to transform brief explanation at the top.

            //Happen once...
            if (verticalSlideFirstTimeCount != -1) {
                verticalSlideFirstTimeCount = 1;
            }
        }
    } // END OF MOUSEMOVE

    function touchend(e) {
        if (isDown) {

            isDown = false;

            var touch;


            if (e.type == 'touchend') //Check for touch event or mousemove
                touch = getTouch(e);
            else
                touch = e;

            $(window).off('mousemove touchmove'); //Stop listening for the mousemove event


            //Check if vertical panning (swipe out) or horizontal panning (carousel swipe)
            //Vertical PANNING
            if (vertical_pan && options.swipe_out) {

                //HAPPENS WHEN SWIPEOUT

                vertical_pan = false; //Back to false for mousewheel (Vertical pan has finished so enable mousewheel scrolling)

                swipeOut();

                return;
            } //Veritcal Pan
            else if ($el.end_animation && !options.disable_slide) { //if finished animation of sliding and swiping is not disabled

                //Calculate deltaTime for calculation of velocity
                var deltaTime = (Date.now() - swipeStartTime);
                //Verify delta is > 0 to avoid divide by 0 error
                deltaTime++;
                vars.velocity = -(touch.pageX - startPointX) / deltaTime;

                if (vars.velocity > 0) { //Set direction
                    vars.direction = 1; //PAN LEFT
                } else {
                    vars.direction = -1;
                }


                vars.distanceFromStart = (touch.pageX - startPointX) * vars.direction * -1; //Yaaa SOOO
                var landingSlideIndex = anim.getLandingSlideIndex(vars.velocity * options.swipe_sensitivity - $el.translate3d().x);

                //TAP is when deltaX is less or equal to 12px

                if (vars.distanceFromStart > 6) {
                    anim.gotoSlideByIndex(landingSlideIndex);
                    return;
                }
            } //Regular horizontal pan until here


            //TAP - click to slide
            $el.trigger({
                type: "clickSlide",
                slide: $el.savedSlideIndex
            });

            if ($el.savedSlideIndex != vars.currentIndex && !options.disable_clicktoslide) { //If this occurs then its a tap
                e.preventDefault();
                anim.gotoSlideByIndex($el.savedSlideIndex);
            }
            //TAP until here
        }

    }


};

function clearSelections() {
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

function getTouch(e) {
    return (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0])); //jQuery for some reason "clones" the event.
}

// EXPORT
module.exports = Navigation;

},{}],7:[function(require,module,exports){
// Object Create
if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

// Stuff to add for compatibility with Zepto
if (!$.fn.outerWidth) {
    $.fn.outerWidth = function () {
        if ($(this)[0] instanceof Element) {
            var el = $(this)[0];
            var width = el.offsetWidth;
            var style = getComputedStyle(el);

            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            return width;
        }
    };
}

},{}],8:[function(require,module,exports){
/*
 This code is for the swipe out feature.
 Can be enabled by setting the swipe_out option to true.
 */

/*
 Wrappers for slide out explantion:
 To apply multiple transforms on one element - you wrap the element with a tag to apply the transform on the tag.
 */

// http://css-tricks.com/useful-nth-child-recipies/

module.exports = {
    slideout: slideout
}

function slideout(_this) {

    var slides = _this.$el;
    var settings = _this.options;
    var vars = _this.vars;

    //Some variables for the swipe out animation
    var swipeOutLandPos = -400,
        swipeOutStartTime = Date.now(),
        currentSwipeOutPos = 0,
        swipeOutGlobalID = 0;

    var durationSave = 0,
        savedOpacity = 0,
        prev;

    var swipeDirection; // check direction of sliding - 1 (true) is up 0 is down


    slides.end_animation = true;

    //For Slideout
    slides.savedSlideIndex = 0;


    var goback = false;
    //Activate swipe out animation


    _this.swipeOut = function () {

        currentSwipeOutPos = $(".itemslide_slideoutwrap").translate3d().y;

        swipeDirection = (currentSwipeOutPos < 0);

        //Check direction of swiping and change land position according
        if (!swipeDirection)
            swipeOutLandPos = 400;
        else
            swipeOutLandPos = -400;


        //Check if to count as slide out or go back
        if (Math.abs(0 - currentSwipeOutPos) < 50) {
            goback = true;
            swipeOutLandPos = 0;
        } else {
            goback = false;

            //Trigger swipeout event
            slides.trigger({
                type: "swipeout",
                slide: slides.savedSlideIndex
            });
        }

        //Some resets

        removeWrapper = 0;

        durationSave = settings.duration;

        prev = slides.savedSlide;

        swipeOutStartTime = Date.now();

        savedOpacity = slides.savedSlide.css("opacity");


        //Replaced gt and lt with a pure css alternative
        if (slides.savedSlideIndex < vars.currentIndex) //Check if before or after
        {
            before = true;
            slides.children(":nth-child(-n+" + (slides.savedSlideIndex + 1) + ")").wrapAll("<div class='itemslide_move' />");
        } else {
            before = false;
            slides.children(":nth-child(n+" + (slides.savedSlideIndex + 2) + ")").wrapAll("<div class='itemslide_move' />");
            /*Hmm looks like it works good on (x+2)*/
        }

        ///BACK
        enableOpacity = true;

        slides.end_animation = false; //Set to disable more swipe out until finished (see swipeOutAnimation end if)

        swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
    };

    var enableOpacity = true,
        currentTime = 0;

    var removeWrapper = 0;

    //RAF Right here
    var before = false;
    var itemslideMove = ".itemslide_move";
    //Animate the swipe out animation (This is called via raf)
    function swipeOutAnimation() {
        currentTime = Date.now() - swipeOutStartTime;

        if (enableOpacity) {
            $(".itemslide_slideoutwrap").translate3d(0, currentSwipeOutPos - easeOutBack(currentTime, 0, currentSwipeOutPos - swipeOutLandPos, 250, 0)); //DURATION VELOCITY
            slides.savedSlide.css("opacity", savedOpacity - easeOutBack(currentTime, 0, savedOpacity, 250, 0) * (goback ? -1 : 1)); //Can try to remove opacity when animating width
        } else {
            //Animate slides after current swiped out slide

            if (goback) //Go back to regular (escape)
            {
                $(".itemslide_slideoutwrap").children().unwrap(); //
                $(itemslideMove).children().unwrap(); //Remove wrapper

                //Just fixing a minor issue with explorer
                slides.children().css("height", "");

                slides.end_animation = true;
                currentTime = 0;

                return;
            }

            //Before - multiply by -1 to turn to positive if before = true
            $(itemslideMove).translate3d(0 - easeOutBack(currentTime - 250, 0, 0 + slides.savedSlide.width(), 125, 0) * (before ? (-1) : 1), 0);

        }

        //Happen once every time
        if (removeWrapper == 1) {

            $(".itemslide_slideoutwrap").children().unwrap();

            //The slide changes to active

            if (slides.savedSlideIndex == vars.currentIndex) //Cool it works
                $(itemslideMove).children(':nth-child(' + (1) + ')').addClass('itemslide-active'); //Change destination index to active

            //Looks like the fix works
            if (slides.savedSlideIndex == (slides.children().length - 1) && !before && slides.savedSlideIndex == vars.currentIndex) //Is in last slide
            {
                settings.duration = 200;
                _this.anim.gotoSlideByIndex(slides.children().length - 2); //Goto last slide (we still didn't remove slide)

            }

            if (slides.savedSlideIndex == 0 && vars.currentIndex != 0) {

                currentTime = 500; //To escape this will finish animation

            }
            removeWrapper = -1;
        }
        //Change current index
        if (currentTime >= 250) {

            enableOpacity = false;

            if (removeWrapper != -1) //Happen once...
                removeWrapper = 1;

            if (currentTime >= 375) {
                $(itemslideMove).children().unwrap(); //Remove wrapper

                slides.removeSlide(prev.index()); //CAN DOO A WIDTH TRICK ;)

                if (slides.savedSlideIndex == 0 && vars.currentIndex != 0 || before) {
                    //change index instant change of active index
                    //Create function in this file to instant reposition.
                    //Or just t3d and getPositionByIndex

                    _this.anim.gotoSlideByIndex(vars.currentIndex - 1, true);

                    //Goto-slide to slide without animation
                }
                settings.duration = durationSave;
                currentTime = 0;
                slides.end_animation = true; //enables future swipe outs
                return;
            }
        }

        swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);

    } //End of raf (Swipe out animation)

} //End of slide out init
},{}]},{},[4]);
