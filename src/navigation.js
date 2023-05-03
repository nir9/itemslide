import { getTranslate3d, setTranslate3d, clamp } from "./animation";
import { wrapElements } from "./slideout";

var Navigation = function (carousel, anim) {
    var $el = carousel.$el,
        options = carousel.options,
        vars = carousel.vars,
        swipeOut = carousel.swipeOut;

    this.createEvents = function () {
        Array.from($el.children).forEach((slide) => {
            for (const eventType of ["mousedown", "touchstart"]) {
                slide.addEventListener(eventType, (e) => {
                    touchstart.call(this, e);
                });
            }
        });

        for (const eventType of ["mouseup", "touchend"]) {
            window.addEventListener(eventType, (e) => {
                touchend(e);
            });
        }
    };

    this.createEvents();

    var swipeStartTime, isDown, startPreventDefault, startPointX, startPointY, vertical_pan = false,
        horizontal_pan;

    var verticalSlideFirstTimeCount;

    this.get_vertical_pan = function () {
        return vertical_pan
    };

    function touchstart(e) {
        if (e.target.getAttribute("no-drag") === "true" || !$el.end_animation) {
            // Or if hasn't ended swipe out escape
            return;
        }

        var touch;

        if (e.type == 'touchstart') {
            touch = getTouch(e);
        } else {
            touch = e;
        }

        swipeStartTime = Date.now();

        isDown = 1;

        startPreventDefault = 0;

        startPointX = touch.pageX;
        startPointY = touch.pageY;

        vertical_pan = false;
        horizontal_pan = false;

        $el.savedSlide = e.target;

        $el.savedSlideIndex = Array.from($el.savedSlide.parentElement.children).indexOf($el.savedSlide);

        verticalSlideFirstTimeCount = 0;

        // Non-passive event listener to enable prevention of default scrolling behavior
        window.addEventListener('mousemove', mousemove, { passive: false });
        window.addEventListener('touchmove', mousemove, { passive: false });

        // Clear selections so they wont affect sliding
        clearSelections();
    }

    var savedStartPt, firstTime;

    function mousemove(e) {
        var touch;

        if (e.type == 'touchmove') {
            touch = getTouch(e);

            if (Math.abs(touch.pageX - startPointX) > 10) {
                startPreventDefault = 1;
            }

            if (startPreventDefault) {
                e.preventDefault();
            }
        } 
        else {
            touch = e;

            // If disabled slide & swipe out do not prevent default to let the marking of text
            if (!options.disable_slide && !options.swipe_out) {
                e.preventDefault();
            }
        }

        // Set direction of panning
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

            if (!firstTime) {
                anim.currentLandPos = getTranslate3d($el).x;
                startPointX = touch.pageX;
            }

            firstTime = 1;

        }

        if (verticalSlideFirstTimeCount == 1) //This will happen once every mousemove when vertical panning
        {
            Array.from($el.children).forEach((slide) => {
                slide.style.height = vars.slideHeight + "px"
            });

            wrapElements([$el.savedSlide], "itemslide_slideoutwrap", true);

            verticalSlideFirstTimeCount = -1;
        }

        //Reposition according to current deltaX
        if (Math.abs(touch.pageX - startPointX) > 6) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
        {
            if (!vertical_pan && $el.end_animation) { //So it will stay one direction
                horizontal_pan = true;
            }

            window.cancelAnimationFrame(anim.slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended

        }

        if (Math.abs(touch.pageY - startPointY) > 6) {
            if (!horizontal_pan && $el.end_animation) {
                vertical_pan = true;
            }
        }

        //Reposition according to horizontal navigation or vertical navigation
        if (horizontal_pan) {

            // Check if user disabled slide - if didn't than go to position according to distance from when horizontal panning started
            if (options.disable_slide) {
                return;
            }

            if (options.left_sided) {
                anim.currentLandPos = clamp(-(vars.allSlidesWidth - $el.parent().width()), 0, anim.currentLandPos);
            }

            vertical_pan = false;

            setTranslate3d($el,
                ((firstTime == 0) ? (savedStartPt - startPointX + (touch.pageX - savedStartPt) / 4) : (touch.pageX - startPointX)) //Check if out of boundaries - if true than add springy panning effect

                + anim.currentLandPos);

            $el.dispatchEvent(new Event("changePos"));
            $el.dispatchEvent(new Event("pan"));

        } else if (vertical_pan && options.swipe_out) {
            e.preventDefault();

            const slideOutWrap = document.querySelector(".itemslide_slideoutwrap");

            if (slideOutWrap) {
                setTranslate3d(slideOutWrap, 0, touch.pageY - startPointY);
            }

            if (verticalSlideFirstTimeCount != -1) {
                verticalSlideFirstTimeCount = 1;
            }
        }
    }

    function touchend(e) {
        if (isDown) {
            isDown = false;

            var touch;


            if (e.type == 'touchend') {
                touch = getTouch(e);
            }
            else {
                touch = e;
            }

            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('touchmove', mousemove);

            // Check if vertical panning (swipe out) or horizontal panning (carousel swipe)
            if (vertical_pan && options.swipe_out) {
                vertical_pan = false; // Back to false for mousewheel (Vertical pan has finished so enable mousewheel scrolling)

                swipeOut();

                return;
            } else if ($el.end_animation && !options.disable_slide) {
                var deltaTime = (Date.now() - swipeStartTime);
                //Verify delta is > 0 to avoid divide by 0 error
                deltaTime++;
                vars.velocity = -(touch.pageX - startPointX) / deltaTime;

                if (vars.velocity > 0) {
                    vars.direction = 1;
                } else {
                    vars.direction = -1;
                }

                vars.distanceFromStart = (touch.pageX - startPointX) * vars.direction * -1;
                var landingSlideIndex = anim.getLandingSlideIndex(vars.velocity * options.swipe_sensitivity - getTranslate3d($el).x);

                if (vars.distanceFromStart > 6) {
                    anim.gotoSlideByIndex(landingSlideIndex);
                    return;
                }
            }

            const clickSlideEvent = new Event("clickSlide", { slide: $el.savedSlideIndex });

            $el.dispatchEvent(clickSlideEvent);

            if ($el.savedSlideIndex != vars.currentIndex && !options.disable_clicktoslide) {
                e.preventDefault();
                anim.gotoSlideByIndex($el.savedSlideIndex);
            }
        }

    }
};

function clearSelections() {
    if (window.getSelection) {
        if (window.getSelection().empty) { // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) { // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) { // IE?
        document.selection.empty();
    }
}

function getTouch(e) {
    if (e.type == "touchmove") {
        return e.changedTouches[0];
    }

    return e.touches[0] || e.changedTouches[0];
}

export default Navigation;
