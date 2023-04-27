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

            if (carousel.getSlidesWidth(false, i) + slides.children().eq(i).outerWidth(true) / 2 -
                slides.children().eq(i).outerWidth(true) * options.pan_threshold * vars.direction - getPositionByIndex(0) > x) {

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
        return -(carousel.getSlidesWidth(false, i) - ((slides.parent().outerWidth(true) - slides.children().eq(i).outerWidth(true)) / (options.left_sided ? 1 : 2)));
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
export default Animations;

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
