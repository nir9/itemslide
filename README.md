# ItemSlide

A simple & beautiful vanilla JavaScript touch carousel

### Features
- Touch swiping
- Mousewheel scrolling
- The ability to "swipe out" slides
- Centered carousel or left sided (default is centered)

## Documentation

### Getting Started

#### Markup
```html
    <div id="scrolling">
        <ul>
            <li>Slide #1</li>
            <li>Slide #2</li>
        </ul>
    </div>
```

#### CSS

For this example CSS, we assume the carousel is contained within an element that has the id "scrolling"

```css
#scrolling {
    overflow: hidden;
}

#scrolling ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    position: absolute;
    -webkit-transform-style: preserve;
    -ms-transform-style: preserve;
    transform-style: preserve;
}

#scrolling ul li {
    float: left;
}
```

#### Include Script

```html
<script src="itemslide.js"></script>
```

#### Initialize

```js
var itemslide;

window.addEventListener("load", () => {
    var element = document.querySelector("#scrolling ul");
    itemslide = new Itemslide(element, {});
});
```

### Options

duration - duration of slide animation {default: 350ms}

swipe_sensitivity - swiping sensitivity {default: 150}

disable_slide - disable swiping and panning {default: false}

disable_clicktoslide - disable click to slide {default: false}

disable_autowidth - disable the automatic calculation of width (so that you could do it manually) {default: false}

disable_scroll - disable the sliding triggered by mousewheel scrolling {default: false}

start - index of slide that appears when initializing {default: 0}

pan_threshold - can be also considered as panning sensitivity {default: 0.3}(precentage of slide width)

one_item - set this to true if the navigation is full screen or one slide every time. {default: false}

parent_width - set this to true if you want the width of the slides to be the width of the parent of ul. {default: false}

swipe_out - set this to true to enable the swipe out feature. {default: false} (

left_sided - left sided carousel (instead of default force-centered) {default: false}

### Methods

getActiveIndex() - get current active slide index

getCurrentPos() - get current position of carousel (pixels)

nextSlide() - goes to next slide

previousSlide() - goes to previous slide

gotoSlide(i) - goes to a specific slide by index

reload() - recalculates width and center object (recommended to call when resize occures)

addSlide(data) - adds in the end of the carousel a new item.

removeSlide(index) - removes a specific slide by index.

NOTE: addSlide automatically adds li tags.

### Events

carouselChangePos - triggered when the position of the carousel is changed

carouselPan - triggered when user pans

carouselChangeActiveIndex - triggered when the current active item has changed

carouselSwipeOut - triggered when user swipes out a slide (if swipe_out is enabled)

> event.slideIndex - get index of swiped out slide

carouselClickSlide - triggered when clicking/tapping a slide

> event.slideIndex - get index of the clicked slide

### Classes

The current active slide gets the 'itemslide-active' class.

### Extras

- attribute 'no-drag'- If you want to disable dragging only on a certain element in the carousel just add this attribute to the element. (example: ```<li no-drag="true">```)
