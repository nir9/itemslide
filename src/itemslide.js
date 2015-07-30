$(function () { //document ready
    "use strict";

    global.isExplorer = !!document.documentMode; // At least IE6

    require("./polyfills");
    var Carousel = require("./carousel");
    var externalFuncs = require("./external_funcs");

    $.fn.itemslide = function (options) {
        var carousel = Object.create(Carousel);
        // Add external functions to element
        externalFuncs.apply(this, carousel);

        carousel.create(options, this);
    };
        
    $.fn.itemslide.options = {
        duration: 350,
        swipe_sensitivity: 150,
        disable_slide: false,
        disable_clicktoslide: false,
        disable_scroll: false,
        start: 0,
        one_item: false, //Set true for full screen navigation or navigation with one item every time
        pan_threshold: 0.3, //Precentage of slide width
        disable_autowidth: false,
        parent_width: false,
        swipe_out: false //Enable the swipe out feature - enables swiping items out of the carousel
    };

    // Function to access t3d
    $.fn.translate3d = function (x, y) {
        if (x != null) { //Set value
            this.css('transform', 'translate3d(' + x + 'px' + ',' + (y || 0) + 'px, 0px)');
        } else { //Get value
            var matrix = matrixToArray(this.css("transform"));

            //Check if jQuery
            if ($.fn.jquery != null) {
                return { //Return object with x and y
                    x: (isExplorer ? parseFloat(matrix[12]) : parseFloat(matrix[4])),
                    y: (isExplorer ? parseFloat(matrix[13]) : parseFloat(matrix[5]))
                };
            }
            else {
                // Zepto
                var vals = this.css('transform').replace("translate3d", "").replace("(", "").replace(")", "").replace(" ", "").replace("px", "").split(","); //Consider regex instead of tons of replaces

                return { //Return object with x and y
                    x: parseFloat(vals[0]),
                    y: parseFloat(vals[1])
                };
            }
        }
    };
});