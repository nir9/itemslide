"use strict";

(function ()
{
var carousel, totalDuration, totalBack, currentPos, startTime;

function gotoSlideByIndex(i, withoutAnimation)
{
	var isBoundary;

	if (i >= carousel.$el.children.length - 1 || i <= 0) {
		isBoundary = true;
		i = Math.min(Math.max(i, 0), carousel.$el.children.length - 1);
	}
	else {
		isBoundary = false;
	}

	changeActiveSlideTo(i);

	totalDuration = Math.max(carousel.options.duration - ((1920 / window.outerWidth) * Math.abs(carousel.vars.velocity) * 9 * (carousel.options.duration / 230)) - (isOutBoundaries() ? (carousel.vars.distanceFromStart / 15) : 0) * (carousel.options.duration / 230), 50);

	totalBack = isBoundary ? ((Math.abs(carousel.vars.velocity) * 250) / window.outerWidth) : 0;
	currentPos = getTranslate3d(carousel.$el).x;
	carousel.currentLandPos = getPositionByIndex(i);

	if (withoutAnimation) {
		setTranslate3d(carousel.$el, getPositionByIndex(i));
		return;
	}

	window.cancelAnimationFrame(carousel.slidesGlobalID);

	startTime = Date.now();
	carousel.slidesGlobalID = window.requestAnimationFrame(animationRepeat);
}

function getLandingSlideIndex(x)
{
	for (var i = 0; i < carousel.$el.children.length; i++) {
		if (carousel.getSlidesWidth(false, i) + carousel.$el.children[i].offsetWidth / 2 -
			carousel.$el.children[i].offsetWidth * carousel.options.panThreshold * carousel.vars.direction - getPositionByIndex(0) > x) {

			if (!carousel.options.oneItem) {
				return i;
			}

			if (i != carousel.vars.currentIndex) {
				return carousel.vars.currentIndex + carousel.vars.direction;
			} else {
				return carousel.vars.currentIndex;
			}
		}
	}

	return carousel.options.oneItem ? carousel.vars.currentIndex + 1 : carousel.$el.children.length - 1;
}

function isOutBoundaries()
{
        return (Math.floor(getTranslate3d(carousel.$el).x) > (getPositionByIndex(0)) && carousel.vars.direction == -1) || (Math.ceil(getTranslate3d(carousel.$el).x) < (getPositionByIndex(carousel.$el.children.length - 1)) && carousel.vars.direction == 1);
}

function changeActiveSlideTo(i)
{
	var oldSlide = carousel.$el.children[carousel.vars.currentIndex || 0];
	oldSlide.className = "";

	carousel.$el.children[i || 0].className = " itemslide-active";

	if (i != carousel.options.currentIndex) {
		carousel.vars.currentIndex = i;
		carousel.$el.dispatchEvent(new Event("carouselChangeActiveIndex"));
	}
}

function getPositionByIndex(i)
{
	var slidesWidth = carousel.getSlidesWidth(false, i);
	var containerMinusSlideWidth = carousel.$el.parentElement.offsetWidth - carousel.$el.children[i].offsetWidth;
	return -(slidesWidth - (containerMinusSlideWidth / (carousel.options.leftSided ? 1 : 2)));
}

function animationRepeat()
{
	var currentTime = Date.now() - startTime;
	
	if (carousel.options.leftSided) {
		carousel.currentLandPos = clamp( -(carousel.vars.allSlidesWidth - carousel.$el.parent().width()), 0, carousel.currentLandPos);
	}

	carousel.$el.dispatchEvent(new Event("carouselChangePos"));

	var x = currentPos - easeOutBack(currentTime, 0, currentPos - carousel.currentLandPos, totalDuration, totalBack);
	setTranslate3d(carousel.$el, x);

	if (currentTime >= totalDuration) {
		setTranslate3d(carousel.$el, carousel.currentLandPos);
		return;
	}

	carousel.slidesGlobalID = requestAnimationFrame(animationRepeat);
}

function easeOutBack(t, b, c, d, elasticity)
{
	if (elasticity == undefined) {
		elasticity = 1.70158;
	}

	return c * ((t = t / d - 1) * t * ((elasticity + 1) * t + elasticity) + 1) + b;
}

function getTranslate3d(element)
{
	var transform = element.style.transform;

	var vals = transform.replace("translate3d", "").replace("(", "").replace(")", "").replace(" ", "").replace("px", "").split(",");

	return {
		x: parseFloat(vals[0]),
		y: parseFloat(vals[1])
	};
}

function setTranslate3d(element, x, y)
{
	element.style.transform = "translate3d(" + x + "px," + (y || 0) + "px, 0px)";
}

function clamp(min, max, value)
{
	return Math.min(Math.max(value, min), max);
}

function getCurrentTotalWidth(inSlides)
{
	var width = 0;

	Array.from(inSlides.children).forEach((slide) => {
		width += slide.offsetWidth;
	});

	return width;
}

function slideout()
{
	var slides = carousel.$el;
	var settings = carousel.options;
	var vars = carousel.vars;

	var swipeOutLandPos = -400,
		swipeOutStartTime = Date.now(),
		currentSwipeOutPos = 0,
		swipeOutGlobalID = 0;

	var durationSave = 0,
		savedOpacity = 1,
		prev;

	var isSwipeDirectionUp;

	carousel.$el.endAnimation = true;
	carousel.$el.savedSlideIndex = 0;

	var goback = false;

	carousel.swipeOut = function () {
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

			var swipeOutEvent = new Event("carouselSwipeOut");
			swipeOutEvent.slideIndex = carousel.$el.savedSlideIndex;
			carousel.$el.dispatchEvent(swipeOutEvent);
		}

		removeWrapper = 0;
		durationSave = settings.duration;
		prev = carousel.$el.savedSlide;
		swipeOutStartTime = Date.now();
		savedOpacity = carousel.$el.savedSlide.style.opacity || 1;

		if (carousel.$el.savedSlideIndex < carousel.vars.currentIndex) {
			before = true;

			var toWrap = carousel.$el.querySelectorAll("ul > li:nth-child(-n+" + (carousel.$el.savedSlideIndex + 1) + ")");

			if (toWrap.length > 0) {
				wrapElements(toWrap, "itemslide_move");
			}
		} else {
			before = false;

			var toWrap = carousel.$el.querySelectorAll("ul > li:nth-child(n+" + (carousel.$el.savedSlideIndex + 2) + ")");

			if (toWrap.length > 0) {
				wrapElements(toWrap, "itemslide_move");
			}
		}

		enableOpacity = true;
		carousel.$el.endAnimation = false;
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
			carousel.$el.savedSlide.style.opacity = savedOpacity - easeOutBack(currentTime, 0, savedOpacity, 250, 0) * (goback ? -1 : 1);
		} else {
			var itemslideMoveElement = document.querySelector(itemslideMove);

			if (goback)
			{
				unwrapElements(document.querySelector(".itemslide_slideoutwrap").children);
				if (itemslideMoveElement) {
					unwrapElements(itemslideMoveElement.children);
				}

				carousel.$el.endAnimation = true;
				currentTime = 0;

				return;
			}

			if (itemslideMoveElement) {
				setTranslate3d(itemslideMoveElement, 0 - easeOutBack(currentTime - 250, 0, 0 + carousel.$el.savedSlide.offsetWidth, 125, 0) * (before ? (-1) : 1), 0);
			}
		}

		if (removeWrapper == 1) {

			unwrapElements(document.querySelector(".itemslide_slideoutwrap").children);

			if (carousel.$el.savedSlideIndex == carousel.vars.currentIndex) {
				var firstMoveSlide = document.querySelector(itemslideMove + ' :nth-child(1)');
				if (firstMoveSlide) {
					firstMoveSlide.className = "itemslide-active";
				}
			}

			if (carousel.$el.savedSlideIndex == (carousel.$el.children.length - 1) && !before && carousel.$el.savedSlideIndex == carousel.vars.currentIndex)
			{
				settings.duration = 200;
				gotoSlideByIndex(carousel.$el.children.length - 2);

			}

			if (carousel.$el.savedSlideIndex == 0 && carousel.vars.currentIndex != 0) {
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

				if ((carousel.$el.savedSlideIndex == 0 && carousel.vars.currentIndex != 0) || (before && carousel.vars.currentIndex != carousel.$el.children.length - 1)) {
					shouldGotoAfterRemoveSlide = true;
				}

				carousel.vars.instance.removeSlide(Array.from(prev.parentElement.children).indexOf(prev));

				if (shouldGotoAfterRemoveSlide) {
					gotoSlideByIndex(carousel.vars.currentIndex - 1, true);
				}

				settings.duration = durationSave;
				currentTime = 0;
				carousel.$el.endAnimation = true;

				return;
			}
		}

		swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
	}
}

function wrapElements(elements, wrapperClassName)
{
	elements = Array.from(elements);

	var wrapperElement = document.createElement("div");
	wrapperElement.className = wrapperClassName;

	var parentElement = elements[0].parentElement;

	parentElement.insertBefore(wrapperElement, elements[0]);

	for (var element of elements) {
		var elementToWrap = parentElement.removeChild(element);

		wrapperElement.appendChild(elementToWrap);
	}
}

function unwrapElements(elements)
{
	elements = Array.from(elements);

	var wrapper = elements[0].parentElement;
	var wrapperNextSibling = wrapper.nextSibling;

	var originalParent = wrapper.parentElement;

	originalParent.removeChild(wrapper);

	for (var element of elements) {
		if (wrapperNextSibling) {
			originalParent.insertBefore(element, wrapperNextSibling);
		} else {
			originalParent.appendChild(element);
		}
	}
}

function createEvents()
{
	Array.from(carousel.$el.children).forEach((slide) => {
		for (var eventType of ["mousedown", "touchstart"]) {
			slide.addEventListener(eventType, (e) => {
				touchstart.call(this, e);
			});
		}
	});

	for (var eventType of ["mouseup", "touchend"]) {
		window.addEventListener(eventType, (e) => {
			touchend(e);
		});
	}
}

var swipeStartTime, isDown, startPreventDefault, startPointX, startPointY, verticalPan = false,
	horizontalPan;

var verticalSlideFirstTimeCount;

function getVerticalPan()
{
	return verticalPan
}

function touchstart(e)
{
	if (e.target.getAttribute("no-drag") === "true" || !carousel.$el.endAnimation) {
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

	verticalPan = false;
	horizontalPan = false;

	carousel.$el.savedSlide = e.target;

	carousel.$el.savedSlideIndex = Array.from(carousel.$el.savedSlide.parentElement.children).indexOf(carousel.$el.savedSlide);

	verticalSlideFirstTimeCount = 0;

	window.addEventListener('mousemove', mousemove, { passive: false });
	window.addEventListener('touchmove', mousemove, { passive: false });

	window.getSelection().removeAllRanges();
}

var savedStartPt, firstTime;

function mousemove(e)
{
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

		if (!carousel.options.disableSlide && !carousel.options.swipeOut) {
			e.preventDefault();
		}
	}

	if ((-(touch.pageX - startPointX)) > 0) {
		carousel.vars.direction = 1;
	} else {
		carousel.vars.direction = -1;
	}

	if (isOutBoundaries()) {
		if (firstTime) {
			savedStartPt = touch.pageX;
			firstTime = 0;
		}
	} else {
		if (!firstTime) {
			carousel.currentLandPos = getTranslate3d(carousel.$el).x;
			startPointX = touch.pageX;
		}

		firstTime = 1;
	}

	if (verticalSlideFirstTimeCount == 1)
	{
		Array.from(carousel.$el.children).forEach((slide) => {
			slide.style.height = carousel.vars.slideHeight + "px"
		});

		wrapElements([carousel.$el.savedSlide], "itemslide_slideoutwrap", true);

		verticalSlideFirstTimeCount = -1;
	}

	if (Math.abs(touch.pageX - startPointX) > 6)
	{
		if (!verticalPan && carousel.$el.endAnimation) {
			horizontalPan = true;
		}

		window.cancelAnimationFrame(carousel.slidesGlobalID);
	}

	if (Math.abs(touch.pageY - startPointY) > 6) {
		if (!horizontalPan && carousel.$el.endAnimation) {
			verticalPan = true;
		}
	}

	if (horizontalPan) {

		if (carousel.options.disableSlide) {
			return;
		}

		if (carousel.options.leftSided) {
			carousel.currentLandPos = clamp(-(carousel.vars.allSlidesWidth - carousel.$el.parent().width()), 0, carousel.currentLandPos);
		}

		verticalPan = false;

		setTranslate3d(carousel.$el,
			((firstTime == 0) ? (savedStartPt - startPointX + (touch.pageX - savedStartPt) / 4) : (touch.pageX - startPointX))

			+ carousel.currentLandPos);

		carousel.$el.dispatchEvent(new Event("carouselChangePos"));
		carousel.$el.dispatchEvent(new Event("carouselPan"));

	} else if (verticalPan && carousel.options.swipeOut) {
		e.preventDefault();

		var slideOutWrap = document.querySelector(".itemslide_slideoutwrap");

		if (slideOutWrap) {
			setTranslate3d(slideOutWrap, 0, touch.pageY - startPointY);
		}

		if (verticalSlideFirstTimeCount != -1) {
			verticalSlideFirstTimeCount = 1;
		}
	}
}

function touchend(e)
{
	if (!isDown) {
		return;
	}

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

	if (verticalPan && carousel.options.swipeOut) {
		verticalPan = false;

		carousel.swipeOut();

		return;
	} else if (carousel.$el.endAnimation && !carousel.options.disableSlide) {
		var deltaTime = (Date.now() - swipeStartTime);
		deltaTime++;
		carousel.vars.velocity = -(touch.pageX - startPointX) / deltaTime;

		if (carousel.vars.velocity > 0) {
			carousel.vars.direction = 1;
		} else {
			carousel.vars.direction = -1;
		}

		carousel.vars.distanceFromStart = (touch.pageX - startPointX) * carousel.vars.direction * -1;
		var landingSlideIndex = getLandingSlideIndex(carousel.vars.velocity * carousel.options.swipeSensitivity - getTranslate3d(carousel.$el).x);

		if (carousel.vars.distanceFromStart > 6) {
			gotoSlideByIndex(landingSlideIndex);
			return;
		}
	}

	var clickSlideEvent = new Event("carouselClickSlide");

	clickSlideEvent.slideIndex = carousel.$el.savedSlideIndex;

	carousel.$el.dispatchEvent(clickSlideEvent);

	if (carousel.$el.savedSlideIndex != carousel.vars.currentIndex && !carousel.options.disableClickToSlide) {
		e.preventDefault();
		gotoSlideByIndex(carousel.$el.savedSlideIndex);
	}
}

function getTouch(e)
{
	if (e.type == "touchmove") {
		return e.changedTouches[0];
	}

	return e.touches[0] || e.changedTouches[0];
}

function addMousewheel() {
	var touchCounter = 0, sensetivity = 4;

	carousel.$el.addEventListener("wheel", (e) => {
		if (!getVerticalPan()) {
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
			var mouseLandingIndex = carousel.vars.currentIndex - (((deltaX == 0 ? deltaY : deltaX) > 0) ? -1 : 1);

			if (mouseLandingIndex >= carousel.$el.children.length || mouseLandingIndex < 0) {
				return;
			}

			carousel.vars.velocity = 0;

			gotoSlideByIndex(mouseLandingIndex);
		}
	});
}

var Carousel = {
create: function (instance, options, element) {
	carousel = this;

	carousel.$el = element;
	carousel.options = options;

	if (carousel.options.parentWidth) {
		element.style.width = element.parentElement.offsetWidth;
	}

	element.style.userSelect = "none";

	carousel.getSlidesWidth = (allSlides = true, maxIndex = 0) => {
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

	carousel.adjustCarouselWidthIfNotDisabled = () => {
		if (!carousel.options.disableAutoWidth) {
			element.style.width = carousel.getSlidesWidth() + 10 + "px";
		}
	};

	carousel.adjustCarouselWidthIfNotDisabled();

	carousel.vars = {
		currentIndex: 0,
		parentWidth: carousel.options.parentWidth,
		velocity: 0,
		slideHeight: element.children[0].offsetHeight,
		direction: 1,
		allSlidesWidth: getCurrentTotalWidth(element),
		instance: instance
	};

	element.endAnimation = true;

	if (carousel.options.swipeOut) {
		slideout(carousel);
	}

	setTranslate3d(element, 0);
	gotoSlideByIndex(parseInt(carousel.options.start));
	createEvents();

	if (!carousel.options.disableScroll) {
		addMousewheel();
	}
}
};

function addExternalFunctions(itemslide, element, carousel)
{
	itemslide.gotoSlide = function (i, noAnimation) {
		gotoSlideByIndex(i, noAnimation);
	};

	itemslide.nextSlide = function () {
		gotoSlideByIndex(carousel.vars.currentIndex + 1);
	};

	itemslide.previousSlide = function () {
		gotoSlideByIndex(carousel.vars.currentIndex - 1);
	};

	itemslide.reload = function (noAnimation) {
		var $el = carousel.$el;
		var vars = carousel.vars;

		if ($el.children.length === 0) {
			return;
		}

		if (carousel.vars.parentWidth) {
			Array.from($el.children).forEach((slide) => slide.style.width = $el.parentElement.offsetWidth);
		}

		carousel.adjustCarouselWidthIfNotDisabled();

		carousel.vars.slideHeight = $el.children[0].offsetHeight;

		carousel.vars.allSlidesWidth = getCurrentTotalWidth($el);

		carousel.vars.velocity = 0;

		itemslide.gotoSlide(carousel.vars.currentIndex, noAnimation);
	};

	itemslide.addSlide = function (data) {
		var newSlide = document.createElement("li");
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
		return getLandingSlideIndex(-x);
	};
}

var defaults = {
    duration: 350,
    swipeSensitivity: 150,
    disableSlide: false,
    disableClickToSlide: false,
    disableScroll: false,
    start: 0,
    oneItem: false, // Set true for "one slide per swipe" navigation (used in the full screen navigation example)
    panThreshold: 0.3, // Percentage of slide width
    disableAutoWidth: false,
    parentWidth: false,
    swipeOut: false, // Enable the swipe out feature - enables swiping items out of the carousel
    leftSided: false // Restricts the movements to the borders instead of the middle
};

function Itemslide(element, options)
{
	var optionsMergedWithDefaults = {};

	Object.assign(optionsMergedWithDefaults, defaults);
	Object.assign(optionsMergedWithDefaults, options);

	addExternalFunctions(this, element, Carousel);

	Carousel.create(this, optionsMergedWithDefaults, element);
}

window.Itemslide = Itemslide;

})();
