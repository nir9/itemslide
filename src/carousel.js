import Navigation from "./navigation";
import Animations from "./animation";
import { getTranslate3d, setTranslate3d, getCurrentTotalWidth } from "./animation";
import { slideout } from "./slideout";
import mousewheel from "./mousewheel";

export default {
    create: function (options, element) {
        let _this = this;

        _this.$el = element;
        _this.options = options;

        if (_this.options.parent_width) {
            element.style.width = element.parentElement.offsetWidth;
        }

        element.style.userSelect = "none";

        _this.getSlidesWidth = (allSlides = true, maxIndex = 0) => {
            var totalWidth = 0;

            if (allSlides) {
                maxIndex = element.children.length;
            }

            for (var i = 0; i < maxIndex; i++) {
                var item = element.children[i];

                totalWidth += item.offsetWidth
                    + parseInt(getComputedStyle(item).marginLeft)
                    + parseInt(getComputedStyle(item).marginRight);
            }

            return totalWidth;
        };

        _this.adjustCarouselWidthIfNotDisabled = () => {
            if (!_this.options.disable_autowidth) {
                element.style.width = _this.getSlidesWidth() + 10 + "px";
            }
        };

        _this.adjustCarouselWidthIfNotDisabled();

        // Note: To add vertical scrolling just set width to slides.children('li').width()

        _this.vars = {
            currentIndex: 0,
            parent_width: _this.options.parent_width,
            velocity: 0,
            slideHeight: element.children[0].offsetHeight,
            direction: 1,
            allSlidesWidth: getCurrentTotalWidth(element)
        };

        element.end_animation = true;

        if (_this.options.swipe_out) {
            slideout(_this);
        }

        var anim = new Animations(_this); // Stuff like gotoslide and the sliding animation
        var nav = new Navigation(_this, anim); // Add navigation like swiping and panning to the carousel

        _this.anim = anim;
        _this.nav = nav;

        setTranslate3d(element, 0);
        anim.gotoSlideByIndex(parseInt(_this.options.start));

        if (!_this.options.disable_scroll) {
            try {
                mousewheel.add(_this, anim, nav, element);
            } catch (e) {
                console.error("ItemSlide: Caught exception while inititalizing mouse wheel plugin", e);
            }
        }
    }
};
