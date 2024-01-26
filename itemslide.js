"use strict";

(function () {

var Animations = function(carousel) {

    var _this = this,
        vars = carousel.vars,
        options = carousel.options,
        slides = carousel.$el;

    var total_duration, total_back, currentPos, startTime;
    _this.gotoSlideByIndex = function (i , without_animation) {
        var isBoundary;

        if (i >= slides.children.length - 1 || i <= 0) {
            isBoundary = true;
            i = Math.min(Math.max(i, 0), slides.children.length - 1);
        }
        else {
            isBoundary = false;
        }

        changeActiveSlideTo(i);

        total_duration = Math.max(options.duration
            - ((1920 / window.outerWidth) * Math.abs(vars.velocity) *
                9 * (options.duration / 230)
            )

            - (_this.isOutBoundaries() ? (vars.distanceFromStart / 15) : 0)
            * (options.duration / 230)

            , 50
        );

        total_back = (isBoundary ? ((Math.abs(vars.velocity) * 250) / window.outerWidth) : 0);
        currentPos = getTranslate3d(slides).x;
        _this.currentLandPos = getPositionByIndex(i);

        if (without_animation) {
            setTranslate3d(slides, getPositionByIndex(i));
            return;
        }

        window.cancelAnimationFrame(_this.slidesGlobalID);

        startTime = Date.now();
        _this.slidesGlobalID = window.requestAnimationFrame(animationRepeat);
    };

    _this.getLandingSlideIndex = function (x) {

        for (var i = 0; i < slides.children.length; i++) {

            if (carousel.getSlidesWidth(false, i) + slides.children[i].offsetWidth / 2 -
                slides.children[i].offsetWidth * options.pan_threshold * vars.direction - getPositionByIndex(0) > x) {

                if (!options.one_item)
                    return i;

                else {
                    if (i != vars.currentIndex)
                        return vars.currentIndex + vars.direction;
                    else
                        return vars.currentIndex;
                }
            }
        }
        return options.one_item ? vars.currentIndex + 1 : slides.children.length - 1;
    };

    _this.isOutBoundaries = function () {
        return (Math.floor(getTranslate3d(slides).x) > (getPositionByIndex(0)) && vars.direction == -1) ||
                 (Math.ceil(getTranslate3d(slides).x) < (getPositionByIndex(slides.children.length - 1)) && vars.direction == 1);
    };


    function changeActiveSlideTo(i) {
        const oldSlide = slides.children[vars.currentIndex || 0];
        oldSlide.className = "";

        slides.children[i || 0].className = " itemslide-active";

        if (i != options.currentIndex) {
            vars.currentIndex = i;
            slides.dispatchEvent(new Event("carouselChangeActiveIndex"));
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

        slides.dispatchEvent(new Event("carouselChangePos"));

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

function easeOutBack(t, b, c, d, s) {
    // s - controls how forward will it go beyond goal
    if (s == undefined) s = 1.70158;

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};

function getTranslate3d(element) {
    const transform = element.style.transform;

    var vals = transform.replace("translate3d", "").replace("(", "").replace(")", "").replace(" ", "").replace("px", "").split(",");

    return {
        x: parseFloat(vals[0]),
        y: parseFloat(vals[1])
    };
}

function setTranslate3d(element, x, y) {
    element.style.transform = `translate3d(${x}px,${(y || 0)}px, 0px)`;
};

function clamp(min, max, value) {
    return Math.min(Math.max(value, min), max);
};

function getCurrentTotalWidth(inSlides) {
	let width = 0;

	Array.from(inSlides.children).forEach((slide) => {
	    width += slide.offsetWidth;
	});

	return width;
};

function slideout(_this) {

    const slides = _this.$el;
    const settings = _this.options;
    const vars = _this.vars;

    let swipeOutLandPos = -400,
        swipeOutStartTime = Date.now(),
        currentSwipeOutPos = 0,
        swipeOutGlobalID = 0;

    let durationSave = 0,
        savedOpacity = 1,
        prev;

    let isSwipeDirectionUp;

    slides.end_animation = true;

    slides.savedSlideIndex = 0;


    let goback = false;

    _this.swipeOut = function () {
        currentSwipeOutPos = getTranslate3d(document.querySelector(".itemslide_slideoutwrap")).y;

        isSwipeDirectionUp = currentSwipeOutPos < 0;

        if (!isSwipeDirectionUp) {
            swipeOutLandPos = 400;
        } else {
            swipeOutLandPos = -400;
        }

        if (Math.abs(0 - currentSwipeOutPos) < 50) {
            goback = true;
            swipeOutLandPos = 0;
        } else {
            goback = false;

            const swipeOutEvent = new Event("carouselSwipeOut");

			swipeOutEvent.slideIndex = slides.savedSlideIndex;

            slides.dispatchEvent(swipeOutEvent);
        }

        removeWrapper = 0;

        durationSave = settings.duration;

        prev = slides.savedSlide;

        swipeOutStartTime = Date.now();

        savedOpacity = slides.savedSlide.style.opacity || 1;

        if (slides.savedSlideIndex < vars.currentIndex) {
            before = true;

            const toWrap = slides.querySelectorAll("ul > li:nth-child(-n+" + (slides.savedSlideIndex + 1) + ")");

            if (toWrap.length > 0) {
                wrapElements(toWrap, "itemslide_move");
            }
        } else {
            before = false;

            const toWrap = slides.querySelectorAll("ul > li:nth-child(n+" + (slides.savedSlideIndex + 2) + ")");

            if (toWrap.length > 0) {
                wrapElements(toWrap, "itemslide_move");
            }
        }

        enableOpacity = true;

        slides.end_animation = false;

        swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
    };

    var enableOpacity = true,
        currentTime = 0;

    var removeWrapper = 0;

    var before = false;
    var itemslideMove = ".itemslide_move";

    function swipeOutAnimation() {
        currentTime = Date.now() - swipeOutStartTime;

        if (enableOpacity) {
            setTranslate3d(document.querySelector(".itemslide_slideoutwrap"), 0, currentSwipeOutPos - easeOutBack(currentTime, 0, currentSwipeOutPos - swipeOutLandPos, 250, 0));
            slides.savedSlide.style.opacity = savedOpacity - easeOutBack(currentTime, 0, savedOpacity, 250, 0) * (goback ? -1 : 1);
        } else {
            const itemslideMoveElement = document.querySelector(itemslideMove);

            if (goback)
            {
                unwrapElements(document.querySelector(".itemslide_slideoutwrap").children);
                if (itemslideMoveElement) {
                    unwrapElements(itemslideMoveElement.children);
                }

                slides.end_animation = true;
                currentTime = 0;

                return;
            }

            if (itemslideMoveElement) {
                setTranslate3d(itemslideMoveElement, 0 - easeOutBack(currentTime - 250, 0, 0 + slides.savedSlide.offsetWidth, 125, 0) * (before ? (-1) : 1), 0);
            }
        }

        if (removeWrapper == 1) {

            unwrapElements(document.querySelector(".itemslide_slideoutwrap").children);

            if (slides.savedSlideIndex == vars.currentIndex) {
                const firstMoveSlide = document.querySelector(itemslideMove + ' :nth-child(1)');
                if (firstMoveSlide) {
                    firstMoveSlide.className = "itemslide-active";
                }
            }

            if (slides.savedSlideIndex == (slides.children.length - 1) && !before && slides.savedSlideIndex == vars.currentIndex)
            {
                settings.duration = 200;
                _this.anim.gotoSlideByIndex(slides.children.length - 2);

            }

            if (slides.savedSlideIndex == 0 && vars.currentIndex != 0) {
                currentTime = 500;
            }

            removeWrapper = -1;
        }

        if (currentTime >= 250) {

            enableOpacity = false;

            if (removeWrapper != -1) {
                removeWrapper = 1;
            }

            if (currentTime >= 375) {
                if (document.querySelector(itemslideMove)) {
                    unwrapElements(document.querySelector(itemslideMove).children);
                }

				var shouldGotoAfterRemoveSlide = false;

                if ((slides.savedSlideIndex == 0 && vars.currentIndex != 0) || (before && vars.currentIndex != slides.children.length - 1)) {
					shouldGotoAfterRemoveSlide = true;
				}

                vars.instance.removeSlide(Array.from(prev.parentElement.children).indexOf(prev));

				if (shouldGotoAfterRemoveSlide) {
                    _this.anim.gotoSlideByIndex(vars.currentIndex - 1, true);
                }

                settings.duration = durationSave;
                currentTime = 0;
                slides.end_animation = true;

                return;
            }
        }

        swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
    }
}

function wrapElements(elements, wrapperClassName) {
    elements = Array.from(elements);

    const wrapperElement = document.createElement("div");
    wrapperElement.className = wrapperClassName;

    const parentElement = elements[0].parentElement;

    parentElement.insertBefore(wrapperElement, elements[0]);

    for (const element of elements) {
        const elementToWrap = parentElement.removeChild(element);

        wrapperElement.appendChild(elementToWrap);
    }
}

function unwrapElements(elements) {
    elements = Array.from(elements);

    const wrapper = elements[0].parentElement;
    const wrapperNextSibling = wrapper.nextSibling;

    const originalParent = wrapper.parentElement;

    originalParent.removeChild(wrapper);

    for (const element of elements) {
        if (wrapperNextSibling) {
            originalParent.insertBefore(element, wrapperNextSibling);
        } else {
            originalParent.appendChild(element);
        }
    }
}

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

        window.addEventListener('mousemove', mousemove, { passive: false });
        window.addEventListener('touchmove', mousemove, { passive: false });

        window.getSelection().removeAllRanges();
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

            if (!options.disable_slide && !options.swipe_out) {
                e.preventDefault();
            }
        }

        if ((-(touch.pageX - startPointX)) > 0) {
            vars.direction = 1;
        } else {
            vars.direction = -1;
        }

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

        if (verticalSlideFirstTimeCount == 1)
        {
            Array.from($el.children).forEach((slide) => {
                slide.style.height = vars.slideHeight + "px"
            });

            wrapElements([$el.savedSlide], "itemslide_slideoutwrap", true);

            verticalSlideFirstTimeCount = -1;
        }

        if (Math.abs(touch.pageX - startPointX) > 6)
        {
            if (!vertical_pan && $el.end_animation) {
                horizontal_pan = true;
            }

            window.cancelAnimationFrame(anim.slidesGlobalID);

        }

        if (Math.abs(touch.pageY - startPointY) > 6) {
            if (!horizontal_pan && $el.end_animation) {
                vertical_pan = true;
            }
        }

        if (horizontal_pan) {

            if (options.disable_slide) {
                return;
            }

            if (options.left_sided) {
                anim.currentLandPos = clamp(-(vars.allSlidesWidth - $el.parent().width()), 0, anim.currentLandPos);
            }

            vertical_pan = false;

            setTranslate3d($el,
                ((firstTime == 0) ? (savedStartPt - startPointX + (touch.pageX - savedStartPt) / 4) : (touch.pageX - startPointX))

                + anim.currentLandPos);

            $el.dispatchEvent(new Event("carouselChangePos"));
            $el.dispatchEvent(new Event("carouselPan"));

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

            if (vertical_pan && options.swipe_out) {
                vertical_pan = false;

                swipeOut();

                return;
            } else if ($el.end_animation && !options.disable_slide) {
                var deltaTime = (Date.now() - swipeStartTime);
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

            const clickSlideEvent = new Event("carouselClickSlide");

			clickSlideEvent.slideIndex = $el.savedSlideIndex;

            $el.dispatchEvent(clickSlideEvent);

            if ($el.savedSlideIndex != vars.currentIndex && !options.disable_clicktoslide) {
                e.preventDefault();
                anim.gotoSlideByIndex($el.savedSlideIndex);
            }
        }

    }
};

function getTouch(e) {
    if (e.type == "touchmove") {
        return e.changedTouches[0];
    }

    return e.touches[0] || e.changedTouches[0];
}

var mousewheel = {
    add: function (_this, anim, nav, slides) {
        var touchCounter = 0,
            sensetivity = 4;

        slides.addEventListener("wheel", (e) => {

            if (!nav.get_vertical_pan()) {
                var deltaY = e.deltaY;
                var deltaX = e.deltaX;
                var delta = e.wheelDelta;

                var isWheel = (delta >= 100 || e.delta % 1 == 0);

                if (!isWheel) {
                    touchCounter++;

                    if (touchCounter == sensetivity) {
                        touchCounter = 0;
                        return;
                    }
                }


                e.preventDefault();
                var mouseLandingIndex = _this.vars.currentIndex - (((deltaX == 0 ? deltaY : deltaX) > 0) ? -1 : 1);

                if (mouseLandingIndex >= slides.children.length || mouseLandingIndex < 0) {
                    return;
                }

                _this.vars.velocity = 0;

                anim.gotoSlideByIndex(mouseLandingIndex);
            }
        });
    }
};

var Carousel = {
    create: function (instance, options, element) {
        let _this = this;

        _this.$el = element;
        _this.options = options;

        if (_this.options.parent_width) {
            element.style.width = element.parentElement.offsetWidth;
        }

        element.style.userSelect = "none";

        _this.getSlidesWidth = (allSlides = true, maxIndex = 0) => {
            var totalWidth = 0;

            if (allSlides) {
                maxIndex = element.children.length;
            }

            for (var i = 0; i < maxIndex; i++) {
                var item = element.children[i];

                totalWidth += item.offsetWidth
                    + parseInt(getComputedStyle(item).marginLeft)
                    + parseInt(getComputedStyle(item).marginRight);
            }

            return totalWidth;
        };

        _this.adjustCarouselWidthIfNotDisabled = () => {
            if (!_this.options.disable_autowidth) {
                element.style.width = _this.getSlidesWidth() + 10 + "px";
            }
        };

        _this.adjustCarouselWidthIfNotDisabled();

        _this.vars = {
            currentIndex: 0,
            parent_width: _this.options.parent_width,
            velocity: 0,
            slideHeight: element.children[0].offsetHeight,
            direction: 1,
            allSlidesWidth: getCurrentTotalWidth(element),
			instance: instance
        };

        element.end_animation = true;

        if (_this.options.swipe_out) {
            slideout(_this);
        }

        var anim = new Animations(_this);
        var nav = new Navigation(_this, anim);

        _this.anim = anim;
        _this.nav = nav;

        setTranslate3d(element, 0);
        anim.gotoSlideByIndex(parseInt(_this.options.start));

        if (!_this.options.disable_scroll) {
            try {
                mousewheel.add(_this, anim, nav, element);
            } catch (e) {
                console.error("ItemSlide: Caught exception while inititalizing mouse wheel plugin", e);
            }
        }
    }
};

function addExternalFunctions(itemslide, element, carousel) {
        itemslide.gotoSlide = function (i, noAnimation) {
            carousel.anim.gotoSlideByIndex(i, noAnimation);
        };

        itemslide.nextSlide = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex + 1);
        };

        itemslide.previousSlide = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex - 1);
        };

        itemslide.reload = function (noAnimation) {
            var $el = carousel.$el;
            var vars = carousel.vars;

            if ($el.children.length === 0) {
                return;
            }

            if (vars.parent_width) {
                Array.from($el.children).forEach((slide) => slide.style.width = $el.parentElement.offsetWidth);
            }

            carousel.adjustCarouselWidthIfNotDisabled();

            vars.slideHeight = $el.children[0].offsetHeight;

            vars.allSlidesWidth = getCurrentTotalWidth($el);

            vars.velocity = 0;

            itemslide.gotoSlide(vars.currentIndex, noAnimation);
        };

        itemslide.addSlide = function (data) {
            const newSlide = document.createElement("li");
            newSlide.innerHTML = data;

            element.appendChild(newSlide);

            carousel.nav.createEvents();

            itemslide.reload();
        };

        itemslide.removeSlide = function (index) {
            if (carousel.vars.currentIndex === carousel.$el.children.length - 1) {
                carousel.vars.currentIndex -= 1;
            }

            carousel.$el.removeChild(carousel.$el.children[index || 0]);
            carousel.vars.allSlidesWidth = getCurrentTotalWidth(carousel.$el);

            itemslide.reload(true);
        };

        itemslide.getActiveIndex = function () {
            return carousel.vars.currentIndex;
        };

        itemslide.getCurrentPos = function () {
            return getTranslate3d(element).x;
        };

        itemslide.getIndexByPosition = function(x) {
            return carousel.anim.getLandingSlideIndex(-x);
        };
}

var defaults = {
    duration: 350,
    swipe_sensitivity: 150,
    disable_slide: false,
    disable_clicktoslide: false,
    disable_scroll: false,
    start: 0,
    one_item: false, // Set true for "one slide per swipe" navigation (used in the full screen navigation example)
    pan_threshold: 0.3, // Percentage of slide width
    disable_autowidth: false,
    parent_width: false,
    swipe_out: false, // Enable the swipe out feature - enables swiping items out of the carousel
    left_sided: false // Restricts the movements to the borders instead of the middle
};

function Itemslide(element, options) {
	var optionsMergedWithDefaults = {};

	Object.assign(optionsMergedWithDefaults, defaults);
	Object.assign(optionsMergedWithDefaults, options);

	addExternalFunctions(this, element, Carousel);

	Carousel.create(this, optionsMergedWithDefaults, element);
}

window.Itemslide = Itemslide;

})();

