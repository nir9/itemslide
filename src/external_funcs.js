// Basically adds all external methods to the object
module.exports = {
    apply: function (slides, carousel) {

        slides.gotoSlide = function (i) {
            carousel.anim.gotoSlideByIndex(i);
        };

        slides.next = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex + 1);
        };

        slides.previous = function () {
            carousel.anim.gotoSlideByIndex(carousel.vars.currentIndex - 1);
        };

        slides.reload = function () { //Get index of active slide
            var $el = carousel.$el;
            var vars = carousel.vars;

            //Update some sizes
            if (vars.parent_width) {
                $el.children().width($el.parent().outerWidth(true)); //resize the slides
            }

            if (!carousel.options.disable_autowidth) {
                $el.css("width", $el.children().length * $el.children().outerWidth(true) + 10); //SET WIDTH
            }

            vars.slideHeight = $el.children().height();

            vars.allSlidesWidth = getCurrentTotalWidth($el);
            // Set panning veloicity to zero
            vars.velocity = 0;

            // w/o animation cuz its smoother
            carousel.anim.gotoSlideByIndex(vars.currentIndex, true);
        };

        slides.addSlide = function (data, tagName) {
            carousel.$el.children().last().append("<" + tagName + ">" + data + "</" + tagName + ">");
            carousel.reload();
        };

        slides.removeSlide = function (index) {
            carousel.$el.children(':nth-child(' + ((index + 1) || 0) + ')').remove();
            carousel.vars.allSlidesWidth = getCurrentTotalWidth(carousel.$el);
            //this.reload();
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
