/*
This code is for the swipe out feature.
Can be enabled by setting the swipe_out option to true.
*/

/*
    Wrappers for slide out explantion:
    To apply multiple transforms on one element - you wrap the element with a tag to apply the transform on the tag.
*/

// http://css-tricks.com/useful-nth-child-recipies/

var isExplorer = !!document.documentMode; // At least IE6

function slideout(slides, settings, vars) {

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

            currentSwipeOutPos = _this.translate3d(null, null, $(".itemslide_slideoutwrap")).y;

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
                slides.children(":nth-child(n+" + (slides.savedSlideIndex + 2) + ")").wrapAll("<div class='itemslide_move' />"); /*Hmm looks like it works good on (x+2)*/
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

        //Animate the swipe out animation (This is called via raf)
        function swipeOutAnimation() {
                //console.log("ASD");
                currentTime = Date.now() - swipeOutStartTime;

                if (enableOpacity) {
                    _this.translate3d(0, currentSwipeOutPos - _this._easeOutBack(currentTime, 0, currentSwipeOutPos - swipeOutLandPos, 250, 0), $(".itemslide_slideoutwrap")); //DURATION VELOCITY
                    slides.savedSlide.css("opacity", savedOpacity - _this._easeOutBack(currentTime, 0, savedOpacity, 250, 0) * (goback ? -1 : 1)); //Can try to remove opacity when animating width
                } else {
                    //Animate slides after current swiped out slide

                    if (goback) //Go back to regular (escape)
                    {
                        $(".itemslide_slideoutwrap").children().unwrap(); //
                        $(".itemslide_move").children().unwrap(); //Remove wrapper

                        if (isExplorer) //Some more propeirtery explorer problems yippe :)
                        {
                            slides.children().css("height", "");
                        }

                        slides.end_animation = true;
                        currentTime = 0;

                        return;
                    }



                    //Before - multiply by -1 to turn to positive if before = true
                    _this.translate3d(0 - _this._easeOutBack(currentTime - 250, 0, 0 + slides.savedSlide.width(), 125, 0) * (before ? (-1) : 1), 0, $(".itemslide_move"));

                }

                //Happen once every time
                if (removeWrapper == 1) {

                    $(".itemslide_slideoutwrap").children().unwrap(); //TODO:CHANGE


                    //The slide changes to active

                    if (slides.savedSlideIndex == vars.currentIndex) //Cool it works
                        $(".itemslide_move").children(':nth-child(' + (1) + ')').addClass(vars.active_class); //Change destination index to active

                    //Looks like the fix works
                    if (slides.savedSlideIndex == (slides.children().length - 1) && !before && slides.savedSlideIndex == vars.currentIndex) //Is in last slide
                    {

                        settings.duration = 200;
                        _this.gotoSlide(slides.children().length - 2); //Goto last slide (we still didn't remove slide)

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
                        $(".itemslide_move").children().unwrap(); //Remove wrapper

                        _this.removeSlide(prev.index()); //CAN DOO A WIDTH TRICK ;)

                        if (slides.savedSlideIndex == 0 && vars.currentIndex != 0 || before) {
                            //change index instant change of active index
                            //Create function in this file to instant reposition.
                            //Or just t3d and getPositionByIndex
                            _this.gotoWithoutAnimation(vars.currentIndex - 1);

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

if ($.fn.itemslide) {
    $.fn.itemslide.slideout = slideout;
} else {
    throw new Error('itemslide not defined. Impossible to use slideout without itemslide');
}
