import { getTranslate3d, setTranslate3d } from "./animation";

export function slideout(_this) {

    const slides = _this.$el;
    const settings = _this.options;
    const vars = _this.vars;

    let swipeOutLandPos = -400,
        swipeOutStartTime = Date.now(),
        currentSwipeOutPos = 0,
        swipeOutGlobalID = 0;

    let durationSave = 0,
        savedOpacity = 0,
        prev;

    var swipeDirection; // check direction of sliding - 1 (true) is up 0 is down


    slides.end_animation = true;

    slides.savedSlideIndex = 0;


    var goback = false;

    _this.swipeOut = function () {

        currentSwipeOutPos = getTranslate3d(document.querySelector(".itemslide_slideoutwrap")).y;

        swipeDirection = currentSwipeOutPos < 0;

        if (!swipeDirection) {
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

        savedOpacity = slides.savedSlide.style.opacity;

        // Replaced gt and lt with a pure css alternative
        if (slides.savedSlideIndex < vars.currentIndex) //Check if before or after
        {
            before = true;
            slides.children(":nth-child(-n+" + (slides.savedSlideIndex + 1) + ")").wrapAll("<div class='itemslide_move' />");
        } else {
            before = false;
            slides.children(":nth-child(n+" + (slides.savedSlideIndex + 2) + ")").wrapAll("<div class='itemslide_move' />");
        }

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
                slides.end_animation = true;

                return;
            }
        }

        swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
    }
}

function wrapElement(element, wrapperClassName) {
}

