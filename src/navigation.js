// All things navigation - touch navigation and mouse
var Navigation = function (carousel, anim) {
    this.$el = carousel.$el;
    this.options = carousel.options;
    this.vars = carousel.vars;
    this.swipeOut = carousel.swipeOut;
    // YUP
    //this._this = this;

    // Access animation methods
    this.anim = anim;

    // yup
    this.vertical_pan = false;

};

Navigation.prototype = {
    touchstart: function (e) {
        //no-drag feature
        this.noDrag = false;
        if ($(e.target).attr('no-drag') === 'true') {
            this.noDrag = true;
            return;
        }

        var touch;

        //Check for touch event or mousemove
        if (e.type == 'touchstart') {
            touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0])); //jQuery for some reason "clones" the event.
        } else {
            touch = e;
        }

        //If hasn't ended swipe out escape
        if (!this.$el.end_animation) {
            return;
        }

        //Reset
        this.swipeStartTime = Date.now();

        this.isDown = 1;

        this.prevent = 0; //to know when to start prevent default

        this.startPointX = touch.pageX;
        this.startPointY = touch.pageY;

        this.vertical_pan = false;
        this.horizontal_pan = false;

        this.$el.savedSlide = $(e.target); // Get the slide that has been pressed

        this.$el.savedSlideIndex = this.$el.savedSlide.index();

        //Swipe out reset
        this.verticalSlideFirstTimeCount = 0;

        //Reset until here


        //Turn on mousemove event when mousedown
        var _this = this;
        $(window).on('mousemove touchmove', function (e) {
            _this.mousemove(e)
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

    // Called by mousemove event (inside the mousedown event)
    mousemove: function (e) {
        var vars = this.vars;
        var options = this.options;

        var touch;
        //Check type of event
        //Check if touch event or mousemove
        if (e.type == 'touchmove') {
            touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]));

            if (Math.abs(touch.pageX - vars.startPointX) > 10) //If touch event than check if to start preventing default behavior
                this.prevent = 1;

            if (this.prevent)
                e.preventDefault();

        }
        else //Regular mousemove
        {
            touch = e;

            // If disabled slide & swipe out do not prevent default to let the marking of text
            if (!options.disable_slide && !options.swipe_out)
                e.preventDefault();
        }

        //Set direction of panning
        if ((-(touch.pageX - this.startPointX)) > 0) { //Set direction
            vars.direction = 1; //PAN LEFT
        } else {
            vars.direction = -1;
        }

        //If out boundaries than set some variables to save previous location before out boundaries
        if (this.anim.isOutBoundaries()) {
            if (this.firstTime) {
                this.savedStartPt = touch.pageX;

                this.firstTime = 0;
            }

        } else {

            if (!this.firstTime) { //Reset Values
                this.anim.currentLandPos = this.$el.translate3d().x;
                this.startPointX = touch.pageX;
            }

            this.firstTime = 1;

        }

        //check if to wrap
        if (this.verticalSlideFirstTimeCount == 1) //This will happen once every mousemove when vertical panning
        {
            if (isExplorer) //Some annoying explorer bug fix
            {
                this.$el.children().css("height", vars.slideHeight);
            }

            this.$el.savedSlide.wrapAll("<div class='itemslide_slideoutwrap' />"); //wrapAll

            this.verticalSlideFirstTimeCount = -1;
        }

        //Reposition according to current deltaX
        if (Math.abs(touch.pageX - this.startPointX) > 6) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
        {
            if (!this.vertical_pan && this.$el.end_animation) //So it will stay one direction
                this.horizontal_pan = true;

            window.cancelAnimationFrame(this.anim.slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended

        }
        //Is vertical panning or horizontal panning
        if (Math.abs(touch.pageY - this.startPointY) > 6) //Is vertical panning
        {
            if (!this.horizontal_pan && this.$el.end_animation) {
                this.vertical_pan = true;
            }
        }


        //Reposition according to horizontal navigation or vertical navigation
        if (this.horizontal_pan) {

            if (options.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when horizontal panning started
                return;
            }

            this.vertical_pan = false;

            this.$el.translate3d(
                ((this.firstTime == 0) ? (this.savedStartPt - this.startPointX + (touch.pageX - this.savedStartPt) / 4) : (touch.pageX - this.startPointX)) //Check if out of boundaries - if true than add springy panning effect

                + this.anim.currentLandPos);

            //Triggers pan and changePos when swiping carousel
            this.$el.trigger('changePos');
            this.$el.trigger('pan');

        } else if (this.vertical_pan && options.swipe_out) { //Swipe out
            e.preventDefault();

            $(".itemslide_slideoutwrap").translate3d(0, touch.pageY - this.startPointY); //Using wrapper to transform brief explanation at the top.

            //Happen once...
            if (this.verticalSlideFirstTimeCount != -1) {
                this.verticalSlideFirstTimeCount = 1;
            }
        }

    }, //End of mousemove function

    touchend: function (e) {
        var vars = this.vars;
        var options = this.options;
        var touch;

        if (this.isDown && this.noDrag == false) {

            if (e.type == 'touchend') //Check for touch event or mousemove
                touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]));
            else
                touch = e;

            this.isDown = false;

            $(window).off('mousemove touchmove'); //Stop listening for the mousemove event


            //Check if vertical panning (swipe out) or horizontal panning (carousel swipe)
            //Vertical PANNING
            if (this.vertical_pan && options.swipe_out) {

                //HAPPENS WHEN SWIPEOUT

                this.vertical_pan = false; //Back to false for mousewheel (Vertical pan has finished so enable mousewheel scrolling)

                this.swipeOut();

                return;
            } //Veritcal Pan
            else if (this.$el.end_animation && !options.disable_slide) { //if finished animation of sliding and swiping is not disabled

                //Calculate deltaTime for calculation of velocity
                var deltaTime = (Date.now() - this.swipeStartTime);
                vars.velocity = -(touch.pageX - this.startPointX) / deltaTime;

                if (vars.velocity > 0) { //Set direction
                    vars.direction = 1; //PAN LEFT
                } else {
                    vars.direction = -1;
                }


                this.vars.distanceFromStart = (touch.pageX - this.startPointX) * vars.direction * -1; //Yaaa SOOO
                var landingSlideIndex = this.anim.getLandingSlideIndex(vars.velocity * options.swipe_sensitivity - this.$el.translate3d().x);

                //TAP is when deltaX is less or equal to 12px

                if (this.vars.distanceFromStart > 6) {
                    this.anim.gotoSlideByIndex(landingSlideIndex);
                    return;
                }
            } //Regular horizontal pan until here


            //TAP - click to slide
            if (this.$el.savedSlide.index() != vars.currentIndex && !options.disable_clicktoslide) { //If this occurs then its a tap
                e.preventDefault();
                this.anim.gotoSlideByIndex(this.$el.savedSlideIndex);
            }
            //TAP until here
        }
    }
}

// EXPORT
module.exports = Navigation;