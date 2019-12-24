// Main
"use strict";

global.isExplorer = !!document.documentMode; // At least IE6


require("./polyfills");
var Carousel = require("./carousel");
var externalFuncs = require("./external_funcs");

var defaults = {
    duration: 350,
    swipe_sensitivity: 150,
    disable_slide: false,
    disable_clicktoslide: false,
    disable_scroll: false,
    start: 0,
    one_item: false, //Set true for "one slide per swipe" navigation (used in the full screen navigation example)
    pan_threshold: 0.3, //Precentage of slide width
    disable_autowidth: false,
    parent_width: false,
    swipe_out: false, //Enable the swipe out feature - enables swiping items out of the carousel
    left_sided: false, // Restricts the movements to the borders instead of the middle
    remove_deprecated_external_functions: false // To not immediately break code that uses deprecated functions
};

// Extend jQuery with the itemslide function
$.fn.itemslide = function (options) {
    var carousel = $.extend(true, {}, Carousel);

    var optionsMergedWithDefaults = $.extend(defaults, options);

    // Add external functions to element
    externalFuncs.apply(this, carousel, optionsMergedWithDefaults);

    // And finally create the carousel
    carousel.create(optionsMergedWithDefaults, this);
};
