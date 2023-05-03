"use strict";

import Carousel from "./carousel";
import { addExternalFunctions } from "./external_funcs";

var defaults = {
    duration: 350,
    swipe_sensitivity: 150,
    disable_slide: false,
    disable_clicktoslide: false,
    disable_scroll: false,
    start: 0,
    one_item: false, // Set true for "one slide per swipe" navigation (used in the full screen navigation example)
    pan_threshold: 0.3, // Percentage of slide width
    disable_autowidth: false,
    parent_width: false,
    swipe_out: false, // Enable the swipe out feature - enables swiping items out of the carousel
    left_sided: false // Restricts the movements to the borders instead of the middle
};

class Itemslide {
    constructor(element, options) {
        let optionsMergedWithDefaults = { ...defaults, ...options };

        addExternalFunctions(element, Carousel);

        Carousel.create(optionsMergedWithDefaults, element);
    }
}

window.Itemslide = Itemslide;
