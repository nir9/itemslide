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

Options are passed as key-values into the object that the ```Itemslide``` constructor gets into the second parameter, for example:

```js
new Itemslide(element, { duration: 100 });
```

Will initialize Itemslide with a custom duration of 100ms.

Here are the available options:

- ```duration``` - duration of slide animation {default: 350ms}
- ```swipeSensitivity``` - swiping sensitivity {default: 150}
- ```disableSlide``` - disable swiping and panning {default: false}
- ```disableClickToSlide``` - disable click to slide {default: false}
- ```disableAutoWidth``` - disable the automatic calculation of width (so that you could do it manually) {default: false}
- ```disableScroll``` - disable the sliding triggered by mousewheel scrolling {default: false}
- ```start``` - index of slide that appears when initializing {default: 0}
- ```panThreshold``` - can be also considered as panning sensitivity {default: 0.3}(precentage of slide width)
- ```oneItem``` - set this to true if the navigation is full screen or one slide every time. {default: false}
- ```parentWidth``` - set this to true if you want the width of the slides to be the width of the parent of ul. {default: false}
- ```swipeOut``` - set this to true to enable the swipe out feature. {default: false} (
- ```leftSided``` - left sided carousel (instead of default force-centered) {default: false}

### Methods

- ```getActiveIndex()``` - get current active slide index
- ```getCurrentPos()``` - get current position of carousel (pixels)
- ```nextSlide()``` - goes to next slide
- ```previousSlide()``` - goes to previous slide
- ```gotoSlide(i)``` - goes to a specific slide by index
- ```reload()``` - recalculates width and center object (recommended to call when resize occures)
- ```addSlide(data)``` - adds in the end of the carousel a new item.
- ```removeSlide(index)``` - removes a specific slide by index.

> NOTE: addSlide automatically adds li tags.

### Events

ItemSlide triggers the following events on the element it is initialized on:

- ```carouselChangePos``` - triggered when the position of the carousel is changed
- ```carouselPan``` - triggered when user pans
- ```carouselChangeActiveIndex``` - triggered when the current active item has changed
- ```carouselSwipeOut``` - triggered when user swipes out a slide (if swipeOut is enabled)
  * ```event.slideIndex``` - get index of swiped out slide
- ```carouselClickSlide``` - triggered when clicking/tapping a slide
  * ```event.slideIndex``` - get index of the clicked slide

### Classes

The current active slide gets the 'itemslide-active' class.

### Extras

- attribute 'no-drag'- If you want to disable dragging only on a certain element in the carousel just add this attribute to the element. (example: ```<li no-drag="true">```)
