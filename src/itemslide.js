/*
This is the main code
*/
//Optional Plugins - jQuery Mousewheel (~2.5KB)

    "use strict";

    if (typeof Object.create !== "function") {
        Object.create = function (obj) {
            function F() {}
            F.prototype = obj;
            return new F();
        };
    }
     
    var isExplorer = !!document.documentMode; // At least IE6
    
    var Slides = {
        init: function(options, element) {
            var _this = this;
            
            this.$el = $(element);
            this.options = $.extend({}, $.fn.itemslide.options, options);
            this.userOptions = options;
            
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
                slideHeight: this.$el.children().height(),
                active_class: 'itemslide-active',
                //Panning Variables
                direction: 0,
                isBoundary: false, //Is current slide the first or last one
                distanceFromStart: 0,
                //Animation variables
                currentPos: 0,
                slidesGlobalID: 0, //rAf id
                total_back: 0,
                touch: false,
                startPointX : 0,
                startPointY: 0,
                //True if current panning
                vertical_pan: false,
                horizontal_pan: false,
                //MouseMove related variables
                firstTime: true,
                savedStartPt: 0,
                //Some swipe out mouse move related vars
                verticalSlideFirstTimeCount: 0, //This is used for the vertical pan if to happen once (to wrap it for later translate 3d it)
                total_duration: this.options.duration,
                /*Swiping and panning events FROM HERE*/
                isDown: false, //Check if mouse was down before mouse up
                prevent: false, //TO prevent default ?
                swipeStartTime: 0
            };
            
            this.$el.end_animation = true;

            if (this.options.swipe_out) {//Check if enabled slideout feature
                $.fn.itemslide.slideout.call(this, this.$el, this.options, this.vars); //Apply slideout (and transfer settings and variables)
            }
            
            this.translate3d(0);

            this.gotoSlideByIndex(this.options.start);
            
            //Swipe out related variables
            this.$el.savedSlideIndex = 0;
            this.$el.on('mousedown touchstart', 'li', function(e) {
                _this.touchstart.call(this, e, _this);
            });
            $(window).on('mouseup touchend', function(e) {
                _this.touchend.call(this, e, _this);
            });
            //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel
            try {
                this.mousewheel(function (e) {
                    if (!_this.options.disable_scroll && !_this.vars.vertical_pan) { //Check if scroll has been disabled
                        e.preventDefault();

                        var mouseLandingIndex = _this.vars.currentIndex - (((e.deltaX == 0 ? e.deltaY : e.deltaX) > 0) ? 1 : -1); //Outer sorthand-if is for it to goto next or prev. the inner for touchpad.

                        if (mouseLandingIndex >= this.$el.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
                            return; //Consider in gotoSlide

                        vars.velocity = 0; //No BOUNCE
                        _this.gotoSlideByIndex(mouseLandingIndex);
                    }
                });
            } catch (e) {}
            //UNTILL HERE MOUSEWHEEL
        },
        
        gotoSlideByIndex: function(i) {
            var vars = this.vars;
            var options = this.options;
            var viewportWidth = this.$el.parent().outerWidth(true);
            var slidesMatchesScreen = 0;
            // Slides count, that matches the screen, calculation. Performed, when slider is scrolled to the right or from the end
            $.each(Array.prototype.reverse.call(this.$el.children('li')), function(i, slide) {
                viewportWidth -= slide.offsetWidth;
                if (viewportWidth <= 0) {
                    slidesMatchesScreen = i;
                    return false;
                }
            });
            var boundarySlideNumber = this.$el.children('li').length - slidesMatchesScreen;

            if (i >= boundarySlideNumber || i <= 0) //If exceeds boundaries dont goto slide
            {
                vars.isBoundary = true;
                i = Math.min(Math.max(i, 0), boundarySlideNumber); //Put in between boundaries
            } else {
                vars.isBoundary = false;
            }


            this.changeActiveSlideTo(i);

            //SET DURATION

            vars.total_duration = Math.max(options.duration

                - ((1920 / $(window).width()) * Math.abs(vars.velocity) *
                    9 * (options.duration / 230) //Velocity Cut

                )

                - (this.isOutBoundaries() ? (vars.distanceFromStart / 15) : 0) // Boundaries Spring cut
                * (options.duration / 230) //Relative to chosen duration

                , 50
            ); //Minimum duration is 10

            //SET DURATION UNTILL HERE

            vars.total_back = (vars.isBoundary ? ((Math.abs(vars.velocity) * 250) / $(window).width()) : 0);


            vars.currentPos = this.translate3d().x;


            this.$el.currentLandPos = this.getPositionByIndex(i);

            //Reset


            window.cancelAnimationFrame(vars.slidesGlobalID);
            
            vars.startTime = Date.now();
            vars.slidesGlobalID = window.requestAnimationFrame(this.animationRepeat.bind(this));

        },
        
        changeActiveSlideTo: function(i) {
            var options = this.options;
            var vars = this.vars;
            
            this.$el.children(':nth-child(' + ((vars.currentIndex + 1) || 0) + ')').removeClass(vars.active_class);

            this.$el.children(':nth-child(' + ((i + 1) || 0) + ')').addClass(vars.active_class); //Change destination index to active

            if (i != options.currentIndex) //Check if landingIndex is different from currentIndex
            {
                vars.currentIndex = i; //Set current index to landing index
                this.$el.trigger('changeActiveIndex');
            }
        },

        getLandingSlideIndex: function(x) { //Get slide that will be selected when silding occured - by position
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

        getPositionByIndex: function(i) { //Here we shall add basic nav
            return  (-i * this.$el.children().outerWidth(true));
        },

        isOutBoundariesLeft: function() {    //Return if user is panning out of left boundaries
            var leftBound = Math.floor(this.translate3d().x) > (this.getPositionByIndex(0)) && this.vars.direction == -1;
            return leftBound;
        },

        isOutBoundariesRight: function() {   //Return if user is panning out of right boundaries
            var slidesCount = this.$el.children('li').length - 1;
            var leftMargin = parseInt(this.$el.first().css('padding-left'));

            var rightBound = (leftMargin + Math.ceil(this.translate3d().x)- this.$el.parent().outerWidth(true)) < (this.getPositionByIndex(slidesCount) - this.$el.children('li').last().outerWidth(true)) && this.vars.direction == 1;
            return rightBound;
        },

        isOutBoundaries: function() { //Return if user is panning out of boundaries
            return (this.isOutBoundariesLeft() || this.isOutBoundariesRight());
        },
        
        touchstart: function(e, _this) {
            var vars = _this.vars;
            
            //Check for touch event or mousemove
            if (e.type == 'touchstart') {
                vars.touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0])); //jQuery for some reason "clones" the event.
            } else {
                vars.touch = e;
            }

            //If hasn't ended swipe out escape
            if (!_this.$el.end_animation)
                return;

            //Reset
            vars.swipeStartTime = Date.now();

            vars.isDown = 1;

            vars.prevent = 0; //to know when to start prevent default

            vars.startPointX = vars.touch.pageX;
            vars.startPointY = vars.touch.pageY;

            vars.vertical_pan = false;
            vars.horizontal_pan = false;

            _this.$el.savedSlide = $(this);

            _this.$el.savedSlideIndex = _this.$el.savedSlide.index();

            //Swipe out reset
            vars.verticalSlideFirstTimeCount = 0;

            //Reset until here


            //Turn on mousemove event when mousedown

            $(window).on('mousemove touchmove', function(e) {
             _this.mousemove.call(this, e, _this)
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
        
        touchend: function(e, _this) {
            var vars = _this.vars;
            var options = _this.options;
            
            if (vars.isDown) {

                if (e.type == 'touchend') //Check for touch event or mousemove
                    vars.touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]));
                else
                    vars.touch = e;

                vars.isDown = false;

                $(window).off('mousemove touchmove'); //Stop listening for the mousemove event


                //Check if vertical panning (swipe out) or horizontal panning (carousel swipe)
                //Vertical PANNING
                if (vars.vertical_pan && options.swipe_out) {

                    //HAPPENS WHEN SWIPEOUT

                    vars.vertical_pan = false; //Back to false for mousewheel (Vertical pan has finished so enable mousewheel scrolling)

                    _this.swipeOut();

                    return;
                } //Veritcal Pan
                else if (_this.$el.end_animation && !options.disable_slide) { //if finished animation of sliding and swiping is not disabled

                    //Calculate deltaTime for calculation of velocity
                    var deltaTime = (Date.now() - vars.swipeStartTime);
                    vars.velocity = -(_this.vars.touch.pageX - vars.startPointX) / deltaTime;

                    if (vars.velocity > 0) { //Set direction
                        vars.direction = 1; //PAN LEFT
                    } else {
                        vars.direction = -1;
                    }


                    vars.distanceFromStart = (_this.vars.touch.pageX - vars.startPointX) * vars.direction * -1; //Yaaa SOOO

                    //TAP is when deltaX is less or equal to 12px
                    if (vars.distanceFromStart > 6 && _this.isOutBoundariesRight()) { //Check distance to see if the event is a tap
                        _this.gotoSlideByIndex(_this.getLandingSlideIndex(vars.velocity * options.swipe_sensitivity - _this.translate3d().x));
                        return;
                    }
                    else if (vars.distanceFromStart > 6 && _this.isOutBoundariesLeft()) {
                        _this.gotoSlideByIndex(_this.getLandingSlideIndex(vars.velocity * options.swipe_sensitivity - _this.translate3d().x));
                        return;
                    }
                    else if (vars.distanceFromStart > 6){
                        _this.gotoSlideByIndex(_this.getLandingSlideIndex(vars.velocity * options.swipe_sensitivity - _this.translate3d().x));
                        return;
                    }
                } //Regular horizontal pan until here


                //TAP - click to slide
                if (_this.$el.savedSlide.index() != vars.currentIndex && !options.disable_clicktoslide) { //If this occurs then its a tap
                    e.preventDefault();
                    _this.gotoSlideByIndex(_this.$el.savedSlide.index());
                }
                //TAP until here

            }
        },
        
        // Called by mousemove event (inside the mousedown event)
        mousemove: function(e, _this) {
            var vars = _this.vars;
            var options = _this.options;
            
            //Check type of event
            if (e.type == 'touchmove') //Check for touch event or mousemove
            {
                vars.touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]));

                if (Math.abs(vars.touch.pageX - vars.startPointX) > 10) //If touch event than check if to start preventing default behavior
                    vars.prevent = 1;

                if (vars.prevent)
                    e.preventDefault();

            } else //Regular mousemove
            {
                vars.touch = e;

                // If disabled slide & swipe out do not prevent default to let the marking of text
                if (!options.disable_slide && !options.swipe_out)
                    e.preventDefault();
            }

            //Set direction of panning
            if ((-(vars.touch.pageX - vars.startPointX)) > 0) { //Set direction
                vars.direction = 1; //PAN LEFT
            } else {
                vars.direction = -1;
            }

            //If out boundaries than set some variables to save previous location before out boundaries
            if (_this.isOutBoundaries()) {

                if (vars.firstTime) {
                    vars.savedStartPt = vars.touch.pageX;

                    vars.firstTime = 0;
                }

            } else {

                if (!vars.firstTime) { //Reset Values
                    _this.$el.currentLandPos = _this.translate3d().x;
                    vars.startPointX = vars.touch.pageX;
                }

                vars.firstTime = 1;

            }

            //check if to wrap
            if (vars.verticalSlideFirstTimeCount == 1) //This will happen once every mousemove when vertical panning
            {

                if (isExplorer) //Some annoying explorer bug fix
                {

                    _this.$el.children().css("height", vars.slideHeight);
                }


                _this.$el.savedSlide.wrapAll("<div class='itemslide_slideoutwrap' />"); //wrapAll

                vars.verticalSlideFirstTimeCount = -1;
            }

            //Reposition according to current deltaX
            if (Math.abs(vars.touch.pageX - vars.startPointX) > 6) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
            {
                if (!vars.vertical_pan && _this.$el.end_animation) //So it will stay one direction
                    vars.horizontal_pan = true;

                window.cancelAnimationFrame(vars.slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended

            }
            //Is vertical panning or horizontal panning
            if (Math.abs(vars.touch.pageY - vars.startPointY) > 6) //Is vertical panning
            {
                if (!vars.horizontal_pan && _this.$el.end_animation) {
                    vars.vertical_pan = true;
                }
            }


            //Reposition according to horizontal navigation or vertical navigation
            if (vars.horizontal_pan) {

                if (options.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when horizontal panning started
                    return;
                }

                vars.vertical_pan = false;

                _this.translate3d(

                    ((vars.firstTime == 0) ? (vars.savedStartPt - vars.startPointX + (vars.touch.pageX - vars.savedStartPt) / 4) : (vars.touch.pageX - vars.startPointX)) //Check if out of boundaries - if true than add springy panning effect

                    + _this.$el.currentLandPos);

                //Triggers pan and changePos when swiping carousel
                _this.$el.trigger('changePos');
                _this.$el.trigger('pan');

            } else if (vars.vertical_pan && options.swipe_out) { //Swipe out
                e.preventDefault();

                _this.translate3d(0, vars.touch.pageY - vars.startPointY, $(".itemslide_slideoutwrap")); //Using wrapper to transform brief explanation at the top.

                if (vars.verticalSlideFirstTimeCount != -1) //Happen once...
                    vars.verticalSlideFirstTimeCount = 1;
            }

        }, //End of mousemove function
        
        //Translates the x or y of an object or returns the x translate value
        translate3d: function (x, y, element) {
            var $el = element?$(element):'' || this.$el;
            
            if (x != null) { //Set value
                $el.css('transform', 'translate3d(' + x + 'px' + ',' + (y || 0) + 'px, 0px)');
            } 
            else { //Get value
                var matrix = this._matrixToArray($el.css("transform"));

                //Check if jQuery
                if ($.fn.jquery != null) { //This happens if has jQuery
                    return { //Return object with x and y
                        x: (isExplorer ? parseFloat(matrix[12]) : parseFloat(matrix[4])),
                        y: (isExplorer ? parseFloat(matrix[13]) : parseFloat(matrix[5]))
                    };
                } 
                else { //This happens if has --Zepto--
                    var vals = this.css('transform').replace("translate3d", "").replace("(", "").replace(")", "").replace(" ", "").replace("px", "").split(","); //Consider regex instead of tons of replaces

                    return { //Return object with x and y
                        x: parseFloat(vals[0]),
                        y: parseFloat(vals[1]) //YESSS Fixed
                    };
                }
            }
        },
        
        //Goto position without sliding animation
        gotoWithoutAnimation: function (i) {
            this.changeActiveSlideTo(i);
            this.vars.currentIndex = i;
            this.$el.currentLandPos = this.getPositionByIndex(i);
            this.translate3d(this.getPositionByIndex(i));
        },
        
        animationRepeat: function() { //Repeats using requestAnimationFrame //For the sliding
            var _this = this;
            var vars = this.vars;
            var currentTime = Date.now() - vars.startTime;

            this.$el.trigger('changePos');

            this.translate3d(vars.currentPos - this._easeOutBack(currentTime, 0, vars.currentPos - this.$el.currentLandPos, vars.total_duration, vars.total_back));

            //to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing


            if (currentTime >= vars.total_duration) { //Check if easing time has reached total duration
                //Animation Ended
                this.translate3d(this.$el.currentLandPos);

                return; //out of recursion
            }

            vars.slidesGlobalID = window.requestAnimationFrame(function(){
                _this.animationRepeat.call(_this);
            });

        },
        
        //General Functions
        _matrixToArray: function(matrix) {
            return matrix.substr(7, matrix.length - 8).split(', ');
        },
        
        _easeOutBack: function(t, b, c, d, s) {
            //s - controls how forward will it go beyond goal
            if (s == undefined) s = 1.70158;

            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },


        //--------------------------------------------------------------------------//


        //Some external functions (see docs)

        // SET Method
        gotoSlide: function (i) {
            this.gotoSlideByIndex(i);
        },

        next: function () {
            this.gotoSlideByIndex(this.vars.currentIndex + 1);
        },

        previous: function () {
            this.gotoSlideByIndex(this.vars.currentIndex - 1);
        },

        reload: function () { //Get index of active slide
            var $el = this.$el;
            var vars = this.vars;
            
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
            this.gotoWithoutAnimation(vars.currentIndex);
        },

        destroy: function() {
            var $el = this.$el;
            var vars = this.vars;
            //remove listeners
            $el.off('mousedown touchstart', 'li');
            $(window).off('mousemove touchmove');
            $(window).off('mouseup touchend');

            //remove classes
            $el.children().removeClass(vars.active_class);
            $el.removeAttr('style');

            //remove data
        },

        addSlide: function (data) {
            this.$el.children('li').last().append("<li>" + data + "</li>");
            this.reload();
        },

        removeSlide: function (index) {
            this.$el.children(':nth-child(' + ((index + 1) || 0) + ')').remove();
            //this.reload();
        },

        // GET Methods

        //Get index of active slide
        getActiveIndex: function () {
            return this.vars.currentIndex;
        },

        //Get current position of carousel
        getCurrentPos: function () {
            return this.translate3d().x;
        }
    };
    
    
    $.fn.itemslide = function (options) {
        var carousel = Object.create(Slides);
        carousel.init(options, this);
        $.data(this, "itemslide", carousel);
        return carousel;
    };
        
    $.fn.itemslide.options = {
        duration: 350,
        swipe_sensitivity: 150,
        disable_slide: false,
        disable_clicktoslide: true,
        disable_scroll: false,
        start: 0,
        one_item: false, //Set true for full screen navigation or navigation with one item every time
        pan_threshold: 0.3, //Precentage of slide width
        disable_autowidth: false,
        parent_width: false,
        swipe_out: false //Enable the swipe out feature - enables swiping items out of the carousel
    };