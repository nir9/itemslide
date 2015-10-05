var Navigation = require("./navigation"),
    Animations = require("./animation"),
    slideout = require("./slideout"),
    mousewheel = require("./mousewheel");

module.exports = {
    create: function (options, element) {
        // Create a new carousel

        var _this = this;

        _this.$el = element;
        _this.options = options;

        if (_this.options.parent_width) {
            element.children().width(element.parent().outerWidth(true)); //resize the slides
        }

        //Setting some css to avoid problems on touch devices
        element.css({
            'touch-action': 'pan-y',
            '-webkit-user-select': 'none',
            '-webkit-touch-callout': 'none',
            '-webkit-user-drag': 'none',
            '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
        });

        if (!_this.options.disable_autowidth) {
            element.css("width", element.children('li').length * element.children().outerWidth(true) + 10); //SET WIDTH
        }
        //Note: To add vertical scrolling just set width to slides.children('li').width()

        _this.vars = {
            currentIndex: 0,
            parent_width: _this.options.parent_width,
            velocity: 0,
            slideHeight: element.children().height(),
            direction: 1,
            allSlidesWidth: getCurrentTotalWidth(element)
        };

        element.end_animation = true;

        //Check if enabled slideout feature
        if (_this.options.swipe_out) {
            slideout.slideout(_this); //Apply slideout (and transfer settings and variables)
        }
        // Init modules
        var anim = new Animations(_this); // Stuff like gotoslide and the sliding animation
        var nav = new Navigation(_this, anim); // Add navigation like swiping and panning to the carousel
        // Give external access
        _this.anim = anim;

        element.translate3d(0);
        anim.gotoSlideByIndex(_this.options.start);

        //Check if scroll has been enabled
        if (!_this.options.disable_scroll) {
            try {
                // Add mousewheel sliding to carousel
                mousewheel.add(_this, anim, nav, element);
            } catch(e) {}
        }
    }
};
