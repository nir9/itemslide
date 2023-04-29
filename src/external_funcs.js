export function addExternalFunctions(element, carousel) {
        element.gotoSlide = function (i) {
            carousel.anim.gotoSlideByIndex(i);
        };

        element.nextSlide = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex + 1);
        };

        element.previousSlide = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex - 1);
        };

        element.reload = function () { // Get index of active slide
            var $el = carousel.$el;
            var vars = carousel.vars;

            if (vars.parent_width) {
                $el.children().width($el.parent().outerWidth(true));
            }

            carousel.adjustCarouselWidthIfNotDisabled();

            vars.slideHeight = $el.children().height();

            vars.allSlidesWidth = getCurrentTotalWidth($el);
            // Set panning veloicity to zero
            vars.velocity = 0;
            // w/o animation cuz its smoother

            element.gotoSlide(vars.currentIndex);
        };

        element.addSlide = function (data) {
            element.append("<li>" + data + "</li>");

            // Refresh events
            carousel.nav.createEvents();

            element.reload();
        };

        element.removeSlide = function (index) {
            carousel.$el.children(':nth-child(' + ((index + 1) || 0) + ')').remove();
            carousel.vars.allSlidesWidth = getCurrentTotalWidth(carousel.$el);
        };

        // GET Methods

        //Get index of active slide
        element.getActiveIndex = function () {
            return carousel.vars.currentIndex;
        };

        //Get current position of carousel
        element.getCurrentPos = function () {
            return element.translate3d().x;
        };

        // Get index of a slide given a position on carousel
        element.getIndexByPosition = function(x) {
            return carousel.anim.getLandingSlideIndex(-x);
        };
}
