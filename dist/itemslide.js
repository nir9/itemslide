(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Animations = function(carousel) {
    this.$el = carousel.$el;
    this.options = carousel.options;
    this.vars = carousel.vars;

};

Animations.prototype = {
    gotoSlideByIndex: function (i) {
        var vars = this.vars;
        var options = this.options;
        var slides = this.$el;

        var isBoundary;

        // Put destination index between boundaries
        if (i >= this.$el.children('li').length - 1 || i <= 0) {
            isBoundary = true;
            i = Math.min(Math.max(i, 0), this.$el.children('li').length - 1); //Put in between boundaries
        } else {
            isBoundary = false;
        }

        this.changeActiveSlideTo(i);

        //SET DURATION
        this.total_duration = Math.max(options.duration
            - ((1920 / $(window).width()) * Math.abs(vars.velocity) *
                9 * (options.duration / 230) //Velocity Cut
            )

            - (this.isOutBoundaries() ? (vars.distanceFromStart / 15) : 0) // Boundaries Spring cut
            * (options.duration / 230) //Relative to chosen duration

            , 50
        ); //Minimum duration is 10
        //SET DURATION UNTILL HERE

        this.total_back = (isBoundary ? ((Math.abs(vars.velocity) * 250) / $(window).width()) : 0);
        this.currentPos = this.$el.translate3d().x;
        this.currentLandPos = this.getPositionByIndex(i);

        //Reset
        window.cancelAnimationFrame(this.slidesGlobalID);

        this.startTime = Date.now();
        this.slidesGlobalID = window.requestAnimationFrame(this.animationRepeat.bind(this));

    },

    changeActiveSlideTo: function (i) {
        var options = this.options;
        var vars = this.vars;

        this.$el.children(':nth-child(' + ((vars.currentIndex + 1) || 0) + ')').removeClass('itemslide-active');

        this.$el.children(':nth-child(' + ((i + 1) || 0) + ')').addClass('itemslide-active'); //Change destination index to active

        //Check if landingIndex is different from currentIndex
        if (i != options.currentIndex) {
            vars.currentIndex = i; //Set current index to landing index
            this.$el.trigger('changeActiveIndex');
        }
    },

    //Get slide that will be selected when silding occured - by position
    getLandingSlideIndex: function (x) {
        var $el = this.$el;
        var options = this.options;
        var vars = this.vars;

        for (var i = 0; i < $el.children('li').length; i++) {

            if ($el.children().outerWidth(true) * i + $el.children().outerWidth(true) / 2 -
                $el.children().outerWidth(true) * options.pan_threshold * vars.direction - this.getPositionByIndex(0) > x) {

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
        return options.one_item ? vars.currentIndex + 1 : $el.children('li').length - 1; //If one item enabled than just go one slide forward and not until the end.
    },

    getPositionByIndex: function (i) { //Here we shall add basic nav
        return -(i * this.$el.children().outerWidth(true) - ((this.$el.parent().outerWidth(true) - this.$el.children().outerWidth(true)) / 2))
    },

    isOutBoundaries: function () { //Return if user is panning out of boundaries
        return (((Math.floor(this.$el.translate3d().x) > (this.getPositionByIndex(0)) && this.vars.direction == -1) || (Math.ceil(this.$el.translate3d().x) < (this.getPositionByIndex(this.$el.children('li').length - 1)) && this.vars.direction == 1)));
    },

    //Goto position without sliding animation
    gotoWithoutAnimation: function (i) {
        this.changeActiveSlideTo(i);
        this.vars.currentIndex = i;
        this.currentLandPos = this.getPositionByIndex(i);
        this.$el.translate3d(this.getPositionByIndex(i));
    },

    //Repeats using requestAnimationFrame //For the sliding
    animationRepeat: function () {
        var _this = this;

        var currentTime = Date.now() - this.startTime;

        this.$el.trigger('changePos');

        this.$el.translate3d(this.currentPos - easeOutBack(currentTime, 0, this.currentPos - this.currentLandPos, this.total_duration, this.total_back));

        // to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing


        if (currentTime >= this.total_duration) { //Check if easing time has reached total duration
            //Animation Ended
            this.$el.translate3d(this.currentLandPos);

            return; //out of recursion
        }

        // yupp
        this.slidesGlobalID = requestAnimationFrame(function() { _this.animationRepeat.call(_this) });

    }
};

// Export object
module.exports = Animations;


//General Functions
global.matrixToArray = function(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}

global.easeOutBack = function(t, b, c, d, s) {
    //s - controls how forward will it go beyond goal
    if (s == undefined) s = 1.70158;

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
// Basically adds all external methods to the object
module.exports = {
    apply: function (slides, carousel) {
        slides.gotoSlide = function (i) {
            carousel.anim.gotoSlideByIndex(i);
        };

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

            if (!vars.disable_autowidth) {
                $el.css("width", $el.children('li').length * $el.children().outerWidth(true) + 10); //SET WIDTH
            }

            vars.slideHeight = $el.children().height();

            // Set panning veloicity to zero
            vars.velocity = 0;

            // w/o animation cuz its smoother
            carousel.anim.gotoWithoutAnimation(vars.currentIndex);
        };

        slides.addSlide = function (data) {
            carousel.$el.children('li').last().append("<li>" + data + "</li>");
            carousel.reload();
        };

        slides.removeSlide = function (index) {
            carousel.$el.children(':nth-child(' + ((index + 1) || 0) + ')').remove();
            //this.reload();
        };

        // GET Methods

        //Get index of active slide
        slides.getActiveIndex = function () {
            return carousel.vars.currentIndex;
        };

        //Get current position of carousel
        slides.getCurrentPos = function () {
            return carousel.anim.translate3d().x;
        };
    }
};
},{}],3:[function(require,module,exports){
var Navigation = require("./navigation");
var Animations = require("./animation");
var slideout = require("./slideout");

module.exports = {
    init: function (options, element) {
        var _this = this;

        this.$el = element;

        this.options = $.extend($.fn.itemslide.options, options);

        if (this.options.parent_width) {
            this.$el.children().width(this.$el.parent().outerWidth(true)); //resize the slides
        }

        this.$el.css({ //Setting some css to avoid problems on touch devices
            'touch-action': 'pan-y',
            '-webkit-user-select': 'none',
            '-webkit-touch-callout': 'none',
            '-webkit-user-drag': 'none',
            '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
        });

        if (!this.options.disable_autowidth)
            this.$el.css("width", this.$el.children('li').length * this.$el.children().outerWidth(true) + 10); //SET WIDTH
        //To add vertical scrolling just set width to slides.children('li').width()

        this.vars = {
            currentIndex: 0,
            disable_autowidth: this.options.disable_autowidth,
            parent_width: this.options.parent_width,
            velocity: 0,
            slideHeight: this.$el.children().height()
        };

        this.$el.end_animation = true;

        if (this.options.swipe_out) { //Check if enabled slideout feature
            slideout.slideout.call(this, this.$el, this.options, this.vars, element); //Apply slideout (and transfer settings and variables)
        }
        // Init modules
        var anim = new Animations(this); // Stuff like gotoslide and the sliding animation
        var nav = new Navigation(this, anim); // Handle swipes

        // Give external access
        this.anim = anim;

        this.$el.translate3d(0);
        anim.gotoSlideByIndex(this.options.start);

        // Start navigation listeners
        this.$el.on('mousedown touchstart', 'li', function (e) {
            nav.touchstart(e);
        });
        $(window).on('mouseup touchend', function (e) {
            nav.touchend(e);
        });

        //For Slideout
        this.$el.savedSlideIndex = 0;

        // And finally mousewheel navigation
        //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel
        try {
            this.$el.mousewheel(function (e) {
                if (!_this.options.disable_scroll && !nav.vertical_pan) { //Check if scroll has been disabled
                    e.preventDefault();

                    var mouseLandingIndex = _this.vars.currentIndex - (((e.deltaX == 0 ? e.deltaY : e.deltaX) > 0) ? 1 : -1); //Outer sorthand-if is for it to goto next or prev. the inner for touchpad.

                    if (mouseLandingIndex >= _this.$el.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
                        return; //Consider in gotoSlide

                    _this.vars.velocity = 0; //No BOUNCE
                    anim.gotoSlideByIndex(mouseLandingIndex);
                }
            });
        } catch (e) {
        }
        //UNTILL HERE MOUSEWHEEL
    }
};

},{"./animation":1,"./navigation":5,"./slideout":7}],4:[function(require,module,exports){
(function (global){
$(function () { //document ready
    "use strict";

    global.isExplorer = !!document.documentMode; // At least IE6

    require("./polyfills");
    var Carousel = require("./init");
    var externalFuncs = require("./external_funcs");

    $.fn.itemslide = function (options) {
        var carousel = Object.create(Carousel);
        externalFuncs.apply(this, carousel);
        carousel.init(options, this);
    };
        
    $.fn.itemslide.options = {
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

    // Function to access t3d
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
    };
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./external_funcs":2,"./init":3,"./polyfills":6}],5:[function(require,module,exports){
// All things navigation - touch navigation and mouse
var Navigation = function (carousel, anim) {
    this.$el = carousel.$el;
    this.options = carousel.options;
    this.vars = carousel.vars;
    this.swipeOut = carousel.swipeOut;
    // YUP
    //this._this = this;

    // Access animation methods
    this.anim = anim;

    // yup
    this.vertical_pan = false;

};

Navigation.prototype = {
    touchstart: function (e) {
        //no-drag feature
        this.noDrag = false;
        if ($(e.target).attr('no-drag') === 'true') {
            this.noDrag = true;
            return;
        }

        var touch;

        //Check for touch event or mousemove
        if (e.type == 'touchstart') {
            touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0])); //jQuery for some reason "clones" the event.
        } else {
            touch = e;
        }

        //If hasn't ended swipe out escape
        if (!this.$el.end_animation) {
            return;
        }

        //Reset
        this.swipeStartTime = Date.now();

        this.isDown = 1;

        this.prevent = 0; //to know when to start prevent default

        this.startPointX = touch.pageX;
        this.startPointY = touch.pageY;

        this.vertical_pan = false;
        this.horizontal_pan = false;

        this.$el.savedSlide = $(e.target); // Get the slide that has been pressed

        this.$el.savedSlideIndex = this.$el.savedSlide.index();

        //Swipe out reset
        this.verticalSlideFirstTimeCount = 0;

        //Reset until here


        //Turn on mousemove event when mousedown
        var _this = this;
        $(window).on('mousemove touchmove', function (e) {
            _this.mousemove(e)
        }); //When mousedown start the handler for mousemove event


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
    },

    // Called by mousemove event (inside the mousedown event)
    mousemove: function (e) {
        var vars = this.vars;
        var options = this.options;

        var touch;
        //Check type of event
        //Check if touch event or mousemove
        if (e.type == 'touchmove') {
            touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]));

            if (Math.abs(touch.pageX - vars.startPointX) > 10) //If touch event than check if to start preventing default behavior
                this.prevent = 1;

            if (this.prevent)
                e.preventDefault();

        }
        else //Regular mousemove
        {
            touch = e;

            // If disabled slide & swipe out do not prevent default to let the marking of text
            if (!options.disable_slide && !options.swipe_out)
                e.preventDefault();
        }

        //Set direction of panning
        if ((-(touch.pageX - this.startPointX)) > 0) { //Set direction
            vars.direction = 1; //PAN LEFT
        } else {
            vars.direction = -1;
        }

        //If out boundaries than set some variables to save previous location before out boundaries
        if (this.anim.isOutBoundaries()) {
            if (this.firstTime) {
                this.savedStartPt = touch.pageX;

                this.firstTime = 0;
            }

        } else {

            if (!this.firstTime) { //Reset Values
                this.anim.currentLandPos = this.$el.translate3d().x;
                this.startPointX = touch.pageX;
            }

            this.firstTime = 1;

        }

        //check if to wrap
        if (this.verticalSlideFirstTimeCount == 1) //This will happen once every mousemove when vertical panning
        {
            if (isExplorer) //Some annoying explorer bug fix
            {
                this.$el.children().css("height", vars.slideHeight);
            }

            this.$el.savedSlide.wrapAll("<div class='itemslide_slideoutwrap' />"); //wrapAll

            this.verticalSlideFirstTimeCount = -1;
        }

        //Reposition according to current deltaX
        if (Math.abs(touch.pageX - this.startPointX) > 6) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
        {
            if (!this.vertical_pan && this.$el.end_animation) //So it will stay one direction
                this.horizontal_pan = true;

            window.cancelAnimationFrame(this.anim.slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended

        }
        //Is vertical panning or horizontal panning
        if (Math.abs(touch.pageY - this.startPointY) > 6) //Is vertical panning
        {
            if (!this.horizontal_pan && this.$el.end_animation) {
                this.vertical_pan = true;
            }
        }


        //Reposition according to horizontal navigation or vertical navigation
        if (this.horizontal_pan) {

            if (options.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when horizontal panning started
                return;
            }

            this.vertical_pan = false;

            this.$el.translate3d(
                ((this.firstTime == 0) ? (this.savedStartPt - this.startPointX + (touch.pageX - this.savedStartPt) / 4) : (touch.pageX - this.startPointX)) //Check if out of boundaries - if true than add springy panning effect

                + this.anim.currentLandPos);

            //Triggers pan and changePos when swiping carousel
            this.$el.trigger('changePos');
            this.$el.trigger('pan');

        } else if (this.vertical_pan && options.swipe_out) { //Swipe out
            e.preventDefault();

            $(".itemslide_slideoutwrap").translate3d(0, touch.pageY - this.startPointY); //Using wrapper to transform brief explanation at the top.

            //Happen once...
            if (this.verticalSlideFirstTimeCount != -1) {
                this.verticalSlideFirstTimeCount = 1;
            }
        }

    }, //End of mousemove function

    touchend: function (e) {
        var vars = this.vars;
        var options = this.options;
        var touch;

        if (this.isDown && this.noDrag == false) {

            if (e.type == 'touchend') //Check for touch event or mousemove
                touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]));
            else
                touch = e;

            this.isDown = false;

            $(window).off('mousemove touchmove'); //Stop listening for the mousemove event


            //Check if vertical panning (swipe out) or horizontal panning (carousel swipe)
            //Vertical PANNING
            if (this.vertical_pan && options.swipe_out) {

                //HAPPENS WHEN SWIPEOUT

                this.vertical_pan = false; //Back to false for mousewheel (Vertical pan has finished so enable mousewheel scrolling)

                this.swipeOut();

                return;
            } //Veritcal Pan
            else if (this.$el.end_animation && !options.disable_slide) { //if finished animation of sliding and swiping is not disabled

                //Calculate deltaTime for calculation of velocity
                var deltaTime = (Date.now() - this.swipeStartTime);
                vars.velocity = -(touch.pageX - this.startPointX) / deltaTime;

                if (vars.velocity > 0) { //Set direction
                    vars.direction = 1; //PAN LEFT
                } else {
                    vars.direction = -1;
                }


                this.vars.distanceFromStart = (touch.pageX - this.startPointX) * vars.direction * -1; //Yaaa SOOO
                var landingSlideIndex = this.anim.getLandingSlideIndex(vars.velocity * options.swipe_sensitivity - this.$el.translate3d().x);

                //TAP is when deltaX is less or equal to 12px

                if (this.vars.distanceFromStart > 6) {
                    this.anim.gotoSlideByIndex(landingSlideIndex);
                    return;
                }
            } //Regular horizontal pan until here


            //TAP - click to slide
            if (this.$el.savedSlide.index() != vars.currentIndex && !options.disable_clicktoslide) { //If this occurs then its a tap
                e.preventDefault();
                this.anim.gotoSlideByIndex(this.$el.savedSlideIndex);
            }
            //TAP until here
        }
    }
}

// EXPORT
module.exports = Navigation;
},{}],6:[function(require,module,exports){
//Raf
var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
        || window[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };

// Object Create
if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

// Stuff to add for compatibility with Zepto
$.fn.outerWidth = function () {
    var el = $(this)[0];
    var width = el.offsetWidth;
    var style = getComputedStyle(el);

    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
}
},{}],7:[function(require,module,exports){
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

function slideout(slides, settings, vars, el) {

    var _this = this;

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

                if (isExplorer) //Some more propeirtery explorer problems yippe :)
                {
                    slides.children().css("height", "");
                }

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

                el.removeSlide(prev.index()); //CAN DOO A WIDTH TRICK ;)

                if (slides.savedSlideIndex == 0 && vars.currentIndex != 0 || before) {
                    //change index instant change of active index
                    //Create function in this file to instant reposition.
                    //Or just t3d and getPositionByIndex

                    _this.anim.gotoWithoutAnimation(vars.currentIndex - 1);

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
