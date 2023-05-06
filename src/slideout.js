import { getTranslate3d, setTranslate3d, easeOutBack } from "./animation";

export function slideout(_this) {

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

        // Check if to count as slide out or go back
        if (Math.abs(0 - currentSwipeOutPos) < 50) {
            goback = true;
            swipeOutLandPos = 0;
        } else {
            goback = false;

            const swipeOutEvent = new Event("swipeout", {
                slide: slides.savedSlideIndex
            });

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

        slides.end_animation = false; // Set to disable more swipe out until finished (see swipeOutAnimation end if)

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
            setTranslate3d(document.querySelector(".itemslide_slideoutwrap"), 0, currentSwipeOutPos - easeOutBack(currentTime, 0, currentSwipeOutPos - swipeOutLandPos, 250, 0)); // DURATION VELOCITY
            slides.savedSlide.style.opacity = savedOpacity - easeOutBack(currentTime, 0, savedOpacity, 250, 0) * (goback ? -1 : 1); // Can try to remove opacity when animating width
        } else {
            //Animate slides after current swiped out slide

            const itemslideMoveElement = document.querySelector(itemslideMove);

            if (goback) //Go back to regular (escape)
            {
                unwrapElements(document.querySelector(".itemslide_slideoutwrap").children);
                if (itemslideMoveElement) {
                    unwrapElements(itemslideMoveElement.children); //Remove wrapper
                }

                // Array.from(slides.children).forEach((slide) => slide.style.height = "");

                slides.end_animation = true;
                currentTime = 0;

                return;
            }

            // Before - multiply by -1 to turn to positive if before = true
            if (itemslideMoveElement) {
                setTranslate3d(itemslideMoveElement, 0 - easeOutBack(currentTime - 250, 0, 0 + slides.savedSlide.offsetWidth, 125, 0) * (before ? (-1) : 1), 0);
            }
        }

        // Happen once every time
        if (removeWrapper == 1) {

            unwrapElements(document.querySelector(".itemslide_slideoutwrap").children);

            if (slides.savedSlideIndex == vars.currentIndex) {
                const firstMoveSlide = document.querySelector(itemslideMove + ' :nth-child(1)');
                if (firstMoveSlide) {
                    firstMoveSlide.className = "itemslide-active"; // Change destination index to active
                }
            }

            // Looks like the fix works
            if (slides.savedSlideIndex == (slides.children.length - 1) && !before && slides.savedSlideIndex == vars.currentIndex) // Is in last slide
            {
                settings.duration = 200;
                _this.anim.gotoSlideByIndex(slides.children.length - 2); // Goto last slide (we still didn't remove slide)

            }

            if (slides.savedSlideIndex == 0 && vars.currentIndex != 0) {
                currentTime = 500; //To escape this will finish animation
            }

            removeWrapper = -1;
        }

        // Change current index
        if (currentTime >= 250) {

            enableOpacity = false;

            if (removeWrapper != -1) { // Happen once...
                removeWrapper = 1;
            }

            if (currentTime >= 375) {
                if (document.querySelector(itemslideMove)) {
                    unwrapElements(document.querySelector(itemslideMove).children); //Remove wrapper
                }

                slides.removeSlide(Array.from(prev.parentElement.children).indexOf(prev)); // CAN DOO A WIDTH TRICK ;)

                if (slides.savedSlideIndex == 0 && vars.currentIndex != 0 || before) {
                    // change index instant change of active index
                    // Create function in this file to instant reposition.
                    // Or just t3d and getPositionByIndex

                    _this.anim.gotoSlideByIndex(vars.currentIndex - 1, true);

                    // Goto-slide to slide without animation
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

export function wrapElements(elements, wrapperClassName) {
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

