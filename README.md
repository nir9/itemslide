itemslide.github.io
===================

jQuery plugin for item sliding

### Dependencies
- [jQuery](http://jquery.com/)
- [Hammer.js](http://hammerjs.github.io/)


How to initialize:

$("ul").initslide();

### Dependencies

- duration - duration of swipe animation {default: 250}
- swipe_sensitivity - swiping sensitivity {default: 250}
- disable_slide - disable swiping and panning {default: false}
- disable_autowidth - disable calculation of width {default: false}
- (if you want to do it manually)

### Methods
##### Get:
- getActiveIndex() - get current active slide index
- getActiveIndex() - get current active slide index
- getCurrentPos() - get current position of carousel (pixels)

##### Set:
- next() - goes to next slide
- previous() - goes to previous slide
- gotoSlide(i) - goes to a specific slide by index
- reload() - recalculates width and center object (recommended to call when resize occures)
		
### Events
- pan - triggered when user pans
- changeActiveIndex - triggered when the current active item has changed

### Easings

Currently the only (and default) easing is easeOutQuart.