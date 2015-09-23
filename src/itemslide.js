// Main...
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
    snap_borders: false, // Restricts the movements to the borders instead of the middle
    swipe_no_Active: false // determine if upon releasing a swipe the active item will change
};


$.fn.itemslide = function (options) {
    var carousel = Object.create(Carousel);
    // Add external functions to element
    externalFuncs.apply(this, carousel);

    // And finally create the carousel
    carousel.create($.extend(defaults, options), this);
};
