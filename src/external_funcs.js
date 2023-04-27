export default {
    apply: function (slides, carousel) {  // slides = jQuery object of carousel, carousel = ItemSlide object with the internal functions

        slides.gotoSlide = function (i) {
            carousel.anim.gotoSlideByIndex(i);
        };

        slides.nextSlide = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex + 1);
        };

        slides.previousSlide = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex - 1);
        };

        slides.reload = function () { // Get index of active slide
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

            slides.gotoSlide(vars.currentIndex);
        };

        slides.addSlide = function (data) {
            slides.append("<li>" + data + "</li>");

            // Refresh events
            carousel.nav.createEvents();

            slides.reload();
        };

        slides.removeSlide = function (index) {
            carousel.$el.children(':nth-child(' + ((index + 1) || 0) + ')').remove();
            carousel.vars.allSlidesWidth = getCurrentTotalWidth(carousel.$el);
        };

        // GET Methods

        //Get index of active slide
        slides.getActiveIndex = function () {
            return carousel.vars.currentIndex;
        };

        //Get current position of carousel
        slides.getCurrentPos = function () {
            return slides.translate3d().x;
        };

        // Get index of a slide given a position on carousel
        slides.getIndexByPosition = function(x) {
            return carousel.anim.getLandingSlideIndex(-x);
        };
    }
};
