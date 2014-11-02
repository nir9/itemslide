ItemSlide.js
===================

jQuery plugin for a touch enabled carousel

[Website](http://itemslide.github.io/)

[Full Screen Example](http://itemslide.github.io/examples/fullscreen_navigation/)

<br/>
<img src="http://itemslide.github.io/website-src/Tested.svg" style="height:175px;"/>
<br/>


### Dependencies
- [jQuery](http://jquery.com/)
- [Hammer.js](http://hammerjs.github.io/)

#### Optional Dependencies (adds features)
- [Hammer jQuery Extension (Adds click to slide) (~0.5KB)](http://itemslide.github.io/dependencies/hammer.jquery.min.js)
- [jQuery Mousewheel (Adds scrolling) (~2.5KB)](http://itemslide.github.io/dependencies/jquery.mousewheel.min.js)


### Downloading

```bash
$ npm install itemslide
```

### CSS

You can use [our exisiting css](http://itemslide.github.io/website-src/sliding.css) and change the sizes or just make your own but make sure that its based upon:

```css

ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    position: absolute;
    
    -webkit-transform-style: preserve-3d;
	-ms-transform-style: preserve-3d;
	transform-style: preserve-3d;
}
li {
    float: left;
}
```

### Markup

```html
<ul>
<li>
Slide #1
</li>
<li>
Slide #2
</li>
</ul>
```

### Initialize

```js
$("ul").initslide();
```

### Options

- duration - duration of swipe animation {default: 250}
- swipe_sensitivity - swiping sensitivity {default: 250}
- disable_slide - disable swiping and panning {default: false}
- disable_autowidth - disable calculation of width {default: false} 
(if you want to do it manually)
- disable_scroll - disable scrolling {default: false}
- start - index of slide that appears when initializing {default: 0}
- pan_threshold - can be also considered as panning sensitivity {default: 0.3}(precentage of slide width)


##### Example implementation
```js
$("ul").initslide(
    {
        disable_slide:true,
        duration:1500
    }
);
```

### Methods
##### Get
- getActiveIndex() - get current active slide index
- getCurrentPos() - get current position of carousel (pixels)

```js
console.log($("ul").getActiveIndex());
```

##### Set
- next() - goes to next slide
- previous() - goes to previous slide
- gotoSlide(i) - goes to a specific slide by index
- reload() - recalculates width and center object (recommended to call when resize occures)
- addSlide(data) - adds in the end of the carousel a new item.
- removeSlide(index) - removes a specific slide by index.
- NOTE: after calling addSlide you need to call reload in order to see the new slides.

```js
$("ul").next();
```

### Events
- changePos - triggered when the position of the carousel is changed
- pan - triggered when user pans
- changeActiveIndex - triggered when the current active item has changed

```js
$("ul").on('changePos', function(event) {
        console.log("new pos: "+ $("ul").getCurrentPos());
});
```

### Id's

The current active slide gets the 'active' id.

### Easings

Currently the only (and default) easing is easeOutQuart.