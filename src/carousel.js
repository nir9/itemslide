import Navigation from "./navigation";
import Animations from "./animation";
import slideout from "./slideout";
import mousewheel from "./mousewheel";

export default {
    create: function (options, element) {
        var _this = this,
            el = element.get()[0];

        _this.$el = element;
        _this.options = options;

        if (_this.options.parent_width) {
            el.style.width = el.parentElement.offsetWidth;
        }

        el.style.userSelect = "none";

        _this.getSlidesWidth = (allSlides = true, maxIndex = 0) => {
            var totalWidth = 0;

            if (allSlides) {
                maxIndex = element.children("li").toArray().length;
            }

            for (var i = 0; i < maxIndex; i++) {
                var item = element.children("li").toArray()[i];

                totalWidth += item.offsetWidth
                    + parseInt(getComputedStyle(item).marginLeft)
                    + parseInt(getComputedStyle(item).marginRight);
            }

            return totalWidth;
        };

        _this.adjustCarouselWidthIfNotDisabled = () => {
            if (!_this.options.disable_autowidth) {
                el.style.width = _this.getSlidesWidth() + 10 + "px";
            }
        };

        _this.adjustCarouselWidthIfNotDisabled();

        // Note: To add vertical scrolling just set width to slides.children('li').width()

        _this.vars = {
            currentIndex: 0,
            parent_width: _this.options.parent_width,
            velocity: 0,
            slideHeight: el.children[0].offsetHeight,
            direction: 1,
            allSlidesWidth: getCurrentTotalWidth(element)
        };

        element.end_animation = true;

        // Check if enabled slideout feature
        if (_this.options.swipe_out) {
            slideout.slideout(_this); // Apply slideout (and transfer settings and variables)
        }

        // Init modules
        var anim = new Animations(_this); // Stuff like gotoslide and the sliding animation
        var nav = new Navigation(_this, anim); // Add navigation like swiping and panning to the carousel

        // Give external access
        _this.anim = anim;
        _this.nav = nav;

        element.translate3d(0);
        anim.gotoSlideByIndex(parseInt(_this.options.start));

        // Check if scroll has been enabled
        if (!_this.options.disable_scroll) {
            try {
                // Add mouse wheel sliding to carousel
                mousewheel.add(_this, anim, nav, element);
            } catch (e) {
                console.error("ItemSlide: Caught exception while inititalizing mouse wheel plugin", e);
            }
        }
    }
};
