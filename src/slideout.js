/*
This code is for the slide out feature.
Can be enabled by setting the slideOut option to true.
*/

/*
    Wrappers for slide out explantion:
    To apply multiple transforms on one element - you wrap the element with a tag to apply the transform on the tag.
*/


function slideout(slides, settings) {


        if (isExplorer) {//Fix annoying bug in ie
            slides.children().height(slides.data("vars").slideHeight);
        }

        //Swipe out section
        var swipeOutLandPos = -400; //Some variables for the swipe out animation
        var swipeOutStartTime = Date.now();
        var currentSwipeOutPos = 0;
        var currentPos2 = 0;
        var swipeOutGlobalID = 0;

        var durationSave = 0;

        var savedOpacity = 0;
        var prev;
        var finish_swiping = false;



        var swipeDirection; // check direction of sliding - 1 (true) is up 0 is down

        slides.end_animation = true;



        var goback = false;
        //Activate swipe out animation




        //slides.swipeOut = function(){
        slides.swipeOut = function () {



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
                slides.trigger('swipeout');
            }


            //Some resets


            removeWrapper = 0;

            durationSave = settings.duration;

            prev = slides.savedSlide;





            swipeOutStartTime = Date.now();

            savedOpacity = slides.savedSlide.css("opacity");



            if (slides.savedSlideIndex < slides.data("vars").currentIndex) //Check if before or after
            {

                before = true;
                slides.children(":lt(" + (slides.savedSlideIndex) + ")").wrapAll("<div class='itemslide_move' />");
            } else {
                before = false;
                slides.children(":gt(" + (slides.savedSlideIndex) + ")").wrapAll("<div class='itemslide_move' />");
            }

            //This is to fix some explorer problems :)
            //alert(
            if (isExplorer) {
                //alert($(".itemslide_move").width());
                //$(".itemslide_move").width($(".itemslide_move").width());

                $(".itemslide_move").height(this.height());

                //alert($(".itemslide_move").height());
            }




            ///BACK
            enableOpacity = true;

            slides.end_animation = false; //Set to disable more swipe out until finished (see swipeOutAnimation end if)


            swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
        }

        var enableOpacity = true;
        var currentTime = 0;



        var removeWrapper = 0;

        //RAF Right here



        var before = false;








        function swipeOutAnimation() //Animate the swipe out animation
            { //And then continue
                currentTime = Date.now() - swipeOutStartTime;




                if (enableOpacity) {
                    //savedSlide
                    // * ((swipeDirection) ? 1 : -1)
                    $(".itemslide_slideoutwrap").translate3d(0, currentSwipeOutPos - easeOutBack(currentTime, 0, currentSwipeOutPos - swipeOutLandPos, 250, 0)); //DURATION VELOCITY
                    slides.savedSlide.css("opacity", savedOpacity - easeOutBack(currentTime, 0, savedOpacity - 0, 250, 0) * (goback ? -1 : 1)); //Can try to remove opacity when animating width

                } else {
                    //Animate slides after current swiped out slide




                    if (goback) //Go back to regular (escape)
                    {
                        $(".itemslide_slideoutwrap").children().unwrap(); //
                        $(".itemslide_move").children().unwrap(); //Remove wrapper
                        slides.end_animation = true;
                        currentTime = 0;

                        return;
                    }


                    $(".itemslide_move").translate3d(0 - easeOutBack(currentTime - 250, 0, 0 + slides.savedSlide.width(), 125, 0) * (before ? (-1) : 1)); //Before - multiply by -1 to turn to positive if before = true




                }


                if (removeWrapper == 1) //Happen once every time
                {



                    //console.log("AD");
                    $(".itemslide_slideoutwrap").children().unwrap(); //TODO:CHANGE
                    //changeActiveSlideTo(prev.index()+1);

                    //The slide changes to active

                    if (slides.savedSlideIndex == slides.data("vars").currentIndex) //Cool it works
                        $(".itemslide_move").children(':nth-child(' + (1) + ')').attr('id', 'active'); //Change destination index to active


                    if (slides.savedSlideIndex == (slides.children().length - 1) && !before) //Is in last slide
                    {
                        //console.log("len "+(slides.children().length-1)+"ssi "+(slides.savedSlideIndex));
                        settings.duration = 200;
                        slides.gotoSlide(slides.children().length - 2); //Goto last slide (we still didn't remove slide)

                    }

                    if (slides.savedSlideIndex == 0 && slides.data("vars").currentIndex != 0) {

                        currentTime = 500; //To escape this will finish animation

                    }



                    removeWrapper = -1;
                }

                //Change current index
                if (currentTime >= 250) {
                    //slides.data("vars").currentIndex = slides.data("vars").currentIndex-1;
                    enableOpacity = false;

                    if (removeWrapper != -1) //Happen once...
                        removeWrapper = 1;


                    if (currentTime >= 375) {




                        $(".itemslide_move").children().unwrap(); //Remove wrapper

                        slides.removeSlide(prev.index()); //CAN DOO A WIDTH TRICK ;)
                        //slides.reload();
                        if (slides.savedSlideIndex == 0 && slides.data("vars").currentIndex != 0 || before) {
                            //change index instant change of active index
                            //Create function in this file to instant reposition.
                            //Or just t3d and getPositionByIndex
                            slides.gotoWithoutAnimation(slides.data("vars").currentIndex - 1);
                            //Goto-slide to slide without animation

                        }

                        settings.duration = durationSave;
                        currentTime = 0;
                        slides.end_animation = true; //enables future swipe outs
                        return;
                    }


                }




                swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
            } //End of raf









    } //End of slide out init
