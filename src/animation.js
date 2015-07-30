var Animations = function(carousel) {
    this.$el = carousel.$el;
    this.options = carousel.options;
    this.vars = carousel.vars;

};

Animations.prototype = {
    gotoSlideByIndex: function (i , without_animation) {
        var vars = this.vars;
        var options = this.options;
        var slides = this.$el;

        var isBoundary;

        // Put destination index between boundaries
        if (i >= this.$el.children('li').length - 1 || i <= 0) {
            isBoundary = true;
            i = Math.min(Math.max(i, 0), this.$el.children('li').length - 1); //Put in between boundaries
        } else {
            isBoundary = false;
        }

        this.changeActiveSlideTo(i);

        //SET DURATION
        this.total_duration = Math.max(options.duration
            - ((1920 / $(window).width()) * Math.abs(vars.velocity) *
                9 * (options.duration / 230) //Velocity Cut
            )

            - (this.isOutBoundaries() ? (vars.distanceFromStart / 15) : 0) // Boundaries Spring cut
            * (options.duration / 230) //Relative to chosen duration

            , 50
        ); //Minimum duration is 10
        //SET DURATION UNTILL HERE

        this.total_back = (isBoundary ? ((Math.abs(vars.velocity) * 250) / $(window).width()) : 0);
        this.currentPos = slides.translate3d().x;
        this.currentLandPos = this.getPositionByIndex(i);

        if(without_animation) {
            //Goto position without sliding animation
            slides.translate3d(this.getPositionByIndex(i));
            // In this case just change position and get out of the function so the animation won't start
            return;
        }


        //Reset
        window.cancelAnimationFrame(this.slidesGlobalID);

        this.startTime = Date.now();
        this.slidesGlobalID = window.requestAnimationFrame(this.animationRepeat.bind(this));

    },

    changeActiveSlideTo: function (i) {
        var options = this.options;
        var vars = this.vars;

        this.$el.children(':nth-child(' + ((vars.currentIndex + 1) || 0) + ')').removeClass('itemslide-active');

        this.$el.children(':nth-child(' + ((i + 1) || 0) + ')').addClass('itemslide-active'); //Change destination index to active

        //Check if landingIndex is different from currentIndex
        if (i != options.currentIndex) {
            vars.currentIndex = i; //Set current index to landing index
            this.$el.trigger('changeActiveIndex');
        }
    },

    //Get slide that will be selected when silding occured - by position
    getLandingSlideIndex: function (x) {
        var $el = this.$el;
        var options = this.options;
        var vars = this.vars;

        for (var i = 0; i < $el.children('li').length; i++) {

            if ($el.children().outerWidth(true) * i + $el.children().outerWidth(true) / 2 -
                $el.children().outerWidth(true) * options.pan_threshold * vars.direction - this.getPositionByIndex(0) > x) {

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
        return options.one_item ? vars.currentIndex + 1 : $el.children('li').length - 1; //If one item enabled than just go one slide forward and not until the end.
    },

    getPositionByIndex: function (i) { //Here we shall add basic nav
        return -(i * this.$el.children().outerWidth(true) - ((this.$el.parent().outerWidth(true) - this.$el.children().outerWidth(true)) / 2))
    },

    isOutBoundaries: function () { //Return if user is panning out of boundaries
        return (((Math.floor(this.$el.translate3d().x) > (this.getPositionByIndex(0)) && this.vars.direction == -1) || (Math.ceil(this.$el.translate3d().x) < (this.getPositionByIndex(this.$el.children('li').length - 1)) && this.vars.direction == 1)));
    },

    //Repeats using requestAnimationFrame //For the sliding
    animationRepeat: function () {
        var _this = this;

        var currentTime = Date.now() - this.startTime;

        this.$el.trigger('changePos');

        this.$el.translate3d(this.currentPos - easeOutBack(currentTime, 0, this.currentPos - this.currentLandPos, this.total_duration, this.total_back));

        // to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing

        if (currentTime >= this.total_duration) { //Check if easing time has reached total duration
            //Animation Ended
            this.$el.translate3d(this.currentLandPos);

            return; //out of recursion
        }

        // yupp
        this.slidesGlobalID = requestAnimationFrame(function() { _this.animationRepeat.call(_this) });

    }
};

// Export object
module.exports = Animations;


//General Functions
global.matrixToArray = function(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}

global.easeOutBack = function(t, b, c, d, s) {
    //s - controls how forward will it go beyond goal
    if (s == undefined) s = 1.70158;

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}