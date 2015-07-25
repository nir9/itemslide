var Navigation = require("./navigation");
var Animations = require("./animation");
var slideout = require("./slideout");

module.exports = {
    init: function (options, element) {
        var _this = this;

        this.$el = element;

        this.options = $.extend($.fn.itemslide.options, options);

        if (this.options.parent_width) {
            this.$el.children().width(this.$el.parent().outerWidth(true)); //resize the slides
        }

        this.$el.css({ //Setting some css to avoid problems on touch devices
            'touch-action': 'pan-y',
            '-webkit-user-select': 'none',
            '-webkit-touch-callout': 'none',
            '-webkit-user-drag': 'none',
            '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
        });

        if (!this.options.disable_autowidth)
            this.$el.css("width", this.$el.children('li').length * this.$el.children().outerWidth(true) + 10); //SET WIDTH
        //To add vertical scrolling just set width to slides.children('li').width()

        this.vars = {
            currentIndex: 0,
            disable_autowidth: this.options.disable_autowidth,
            parent_width: this.options.parent_width,
            velocity: 0,
            slideHeight: this.$el.children().height()
        };

        this.$el.end_animation = true;

        if (this.options.swipe_out) { //Check if enabled slideout feature
            slideout.slideout.call(this, this.$el, this.options, this.vars, element); //Apply slideout (and transfer settings and variables)
        }
        // Init modules
        var anim = new Animations(this); // Stuff like gotoslide and the sliding animation
        var nav = new Navigation(this, anim); // Handle swipes

        // Give external access
        this.anim = anim;

        this.$el.translate3d(0);
        anim.gotoSlideByIndex(this.options.start);

        // Start navigation listeners
        this.$el.on('mousedown touchstart', 'li', function (e) {
            nav.touchstart(e);
        });
        $(window).on('mouseup touchend', function (e) {
            nav.touchend(e);
        });

        //For Slideout
        this.$el.savedSlideIndex = 0;

        // And finally mousewheel navigation
        //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel
        try {
            this.$el.mousewheel(function (e) {
                if (!_this.options.disable_scroll && !nav.vertical_pan) { //Check if scroll has been disabled
                    e.preventDefault();

                    var mouseLandingIndex = _this.vars.currentIndex - (((e.deltaX == 0 ? e.deltaY : e.deltaX) > 0) ? 1 : -1); //Outer sorthand-if is for it to goto next or prev. the inner for touchpad.

                    if (mouseLandingIndex >= _this.$el.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
                        return; //Consider in gotoSlide

                    _this.vars.velocity = 0; //No BOUNCE
                    anim.gotoSlideByIndex(mouseLandingIndex);
                }
            });
        } catch (e) {
        }
        //UNTILL HERE MOUSEWHEEL
    }
};
