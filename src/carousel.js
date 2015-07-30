var Navigation = require("./navigation");
var Animations = require("./animation");
var slideout = require("./slideout");

module.exports = {
    create: function (options, element) {
        // Create a new carousel

        var _this = this;

        _this.$el = element;

        _this.options = $.extend($.fn.itemslide.options, options);

        if (_this.options.parent_width) {
            element.children().width(element.parent().outerWidth(true)); //resize the slides
        }

        element.css({ //Setting some css to avoid problems on touch devices
            'touch-action': 'pan-y',
            '-webkit-user-select': 'none',
            '-webkit-touch-callout': 'none',
            '-webkit-user-drag': 'none',
            '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
        });

        if (!_this.options.disable_autowidth)
            element.css("width", element.children('li').length * element.children().outerWidth(true) + 10); //SET WIDTH
        //To add vertical scrolling just set width to slides.children('li').width()

        _this.vars = {
            currentIndex: 0,
            parent_width: _this.options.parent_width,
            velocity: 0,
            slideHeight: element.children().height()
        };

        element.end_animation = true;

        if (_this.options.swipe_out) { //Check if enabled slideout feature
            slideout.slideout(_this); //Apply slideout (and transfer settings and variables)
        }
        // Init modules
        var anim = new Animations(_this); // Stuff like gotoslide and the sliding animation
        var nav = new Navigation(_this, anim); // Add navigation like swiping and panning to the carousel
        // Give external access
        _this.anim = anim;

        element.translate3d(0);
        anim.gotoSlideByIndex(_this.options.start);


        //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel
        try {
            element.mousewheel(function (e) {
                if (!_this.options.disable_scroll && !nav.get_vertical_pan()) { //Check if scroll has been disabled
                    e.preventDefault();

                    var mouseLandingIndex = _this.vars.currentIndex - (((e.deltaX == 0 ? e.deltaY : e.deltaX) > 0) ? 1 : -1); //Outer sorthand-if is for it to goto next or prev. the inner for touchpad.

                    if (mouseLandingIndex >= element.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
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
