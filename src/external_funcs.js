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
                $el.css("width", $el.children('li').length * $el.children().outerWidth(true) + 10); //SET WIDTH
            }

            vars.slideHeight = $el.children().height();

            // Set panning veloicity to zero
            vars.velocity = 0;

            // w/o animation cuz its smoother
            carousel.anim.gotoSlideByIndex(vars.currentIndex, true);
        };

        slides.addSlide = function (data) {
            carousel.$el.children('li').last().append("<li>" + data + "</li>");
            carousel.reload();
        };

        slides.removeSlide = function (index) {
            carousel.$el.children(':nth-child(' + ((index + 1) || 0) + ')').remove();
            //this.reload();
        };

        // GET Methods

        //Get index of active slide
        slides.getActiveIndex = function () {
            return carousel.vars.currentIndex;
        };

        //Get current position of carousel
        slides.getCurrentPos = function () {
            return carousel.anim.translate3d().x;
        };
    }
};