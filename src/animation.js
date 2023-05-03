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
        if (i >= slides.children.length - 1 || i <= 0) {
            isBoundary = true;
            i = Math.min(Math.max(i, 0), slides.children.length - 1); //Put in between boundaries
        }
        else {
            isBoundary = false;
        }

        changeActiveSlideTo(i);

        // Minimum duration is 10
        total_duration = Math.max(options.duration
            - ((1920 / window.outerWidth) * Math.abs(vars.velocity) *
                9 * (options.duration / 230) //Velocity Cut
            )

            - (_this.isOutBoundaries() ? (vars.distanceFromStart / 15) : 0) // Boundaries Spring cut
            * (options.duration / 230) //Relative to chosen duration

            , 50
        );

        total_back = (isBoundary ? ((Math.abs(vars.velocity) * 250) / window.outerWidth) : 0);
        currentPos = getTranslate3d(slides).x;
        _this.currentLandPos = getPositionByIndex(i);

        if (without_animation) {
            setTranslate3d(slides, getPositionByIndex(i));
            // In this case just change position and get out of the function so the animation won't start
            return;
        }

        // Reset
        window.cancelAnimationFrame(_this.slidesGlobalID);

        startTime = Date.now();
        _this.slidesGlobalID = window.requestAnimationFrame(animationRepeat);
    };

    _this.getLandingSlideIndex = function (x) {
        // Get slide that will be selected when sliding occurred - by position

        for (var i = 0; i < slides.children.length; i++) {

            if (carousel.getSlidesWidth(false, i) + slides.children[i].offsetWidth / 2 -
                slides.children[i].offsetWidth * options.pan_threshold * vars.direction - getPositionByIndex(0) > x) {

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
        return options.one_item ? vars.currentIndex + 1 : slides.children.length - 1; //If one item enabled than just go one slide forward and not until the end.
    };

    _this.isOutBoundaries = function () { //Return if user is panning out of boundaries
        return (Math.floor(getTranslate3d(slides).x) > (getPositionByIndex(0)) && vars.direction == -1) ||
                 (Math.ceil(getTranslate3d(slides).x) < (getPositionByIndex(slides.children.length - 1)) && vars.direction == 1);
    };


    function changeActiveSlideTo(i) {
        const oldSlide = slides.children[vars.currentIndex || 0];
        oldSlide.className = "";

        slides.children[i || 0].className = " itemslide-active"; //Change destination index to active

        if (i != options.currentIndex) {
            vars.currentIndex = i;
            slides.dispatchEvent(new Event("changeActiveIndex"));
        }
    }

    function getPositionByIndex(i) {
        const slidesWidth = carousel.getSlidesWidth(false, i);
        const containerMinusSlideWidth = slides.parentElement.offsetWidth - slides.children[i].offsetWidth;
        return -(slidesWidth - (containerMinusSlideWidth / (options.left_sided ? 1 : 2)));
    }

    function animationRepeat() {
        var currentTime = Date.now() - startTime;
        
        if (options.left_sided) {
        	_this.currentLandPos = clamp( -(vars.allSlidesWidth - slides.parent().width()), 0, _this.currentLandPos);
        }

        slides.dispatchEvent(new Event("changePos"));

        const x = currentPos - easeOutBack(currentTime, 0, currentPos - _this.currentLandPos, total_duration, total_back);
        setTranslate3d(slides, x);

        // to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing

        if (currentTime >= total_duration) {
            setTranslate3d(slides, _this.currentLandPos);
            return;
        }

        _this.slidesGlobalID = requestAnimationFrame(animationRepeat);
    }
};

export default Animations;

export function easeOutBack(t, b, c, d, s) {
    // s - controls how forward will it go beyond goal
    if (s == undefined) s = 1.70158;

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};

export function getTranslate3d(element) {
    const transform = element.style.transform;

    var vals = transform.replace("translate3d", "").replace("(", "").replace(")", "").replace(" ", "").replace("px", "").split(","); // Consider regex instead of tons of replaces

    return { // Return object with x and y
        x: parseFloat(vals[0]),
        y: parseFloat(vals[1])
    };
}

export function setTranslate3d(element, x, y) {
    element.style.transform = `translate3d(${x}px,${(y || 0)}px, 0px)`;
};

export function clamp(min, max, value) {
    return Math.min(Math.max(value, min), max);
};

export function getCurrentTotalWidth(inSlides) { // Returns the total number of pixels for each items
	let width = 0;

	Array.from(inSlides.children).forEach((slide) => {
	    width += slide.offsetWidth;
	});

	return width;
};
