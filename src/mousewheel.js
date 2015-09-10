// Add mousewheel capability to carousel
// IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel

// https://css-tricks.com/snippets/javascript/test-mac-pc-javascript/

module.exports = {
    add: function (_this, anim, nav, slides) {
        // Add a mousewheel listener to carousel
        var touchCounter = 0,
            sensetivity = 7; // Less is more (for the touchpad)

        slides.mousewheel(function (e) {
            var isWheel = (e.deltaFactor >= 100 && e.deltaFactor % 1 == 0);

            // different behavior for touchpad...
            if (!isWheel) {
                touchCounter++;

                if (!(touchCounter % sensetivity == 0))
                    return;
            }

            // Check if vertical pan is occuring...
            if (!nav.get_vertical_pan()) {

                e.preventDefault();
                //Outer sorthand-if is for it to goto next or prev. the inner for touchpad.
                var mouseLandingIndex = _this.vars.currentIndex - (((e.deltaX == 0 ? e.deltaY : e.deltaX) > 0) ? 1 : -1);

                if (mouseLandingIndex >= slides.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
                    return; //Consider in gotoSlide

                _this.vars.velocity = 0; //No BOUNCE

                anim.gotoSlideByIndex(mouseLandingIndex);
            }
        });
    }
};
