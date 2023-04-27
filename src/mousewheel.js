export default {
    add: function (_this, anim, nav, slides) {
        // Add a mousewheel listener to carousel
        var touchCounter = 0,
            sensetivity = 4; // Less is more (for the touchpad)

        slides.on("wheel", function (e) {

            // Check if vertical pan is occuring... (if occuring dont continue)
            if (!nav.get_vertical_pan()) {
                var deltaY = e.originalEvent.deltaY;
                var deltaX = e.originalEvent.deltaX;
                var delta = e.originalEvent.wheelDelta;

                var isWheel = (delta >= 100 || e.delta % 1 == 0);

                if (!isWheel) {
                    // different behavior for touchpad...
                    touchCounter++;

                    if (touchCounter == sensetivity) {
                        touchCounter = 0;
                        return;
                    }
                }


                e.preventDefault();
                // Outer sorthand-if is for it to goto next or prev. the inner for touchpad.
                var mouseLandingIndex = _this.vars.currentIndex - (((deltaX == 0 ? deltaY : deltaX) > 0) ? -1 : 1);

                if (mouseLandingIndex >= slides.children('li').length || mouseLandingIndex < 0) { // If exceeds boundaries dont goto slide
                    return; //Consider in gotoSlide
                }

                _this.vars.velocity = 0; //No BOUNCE

                anim.gotoSlideByIndex(mouseLandingIndex);
            }
        });
    }
};
