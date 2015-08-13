// Main...

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