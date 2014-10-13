ItemSlide.js
===================

jQuery plugin for a touch enabled carousel

[Website](http://itemslide.github.io/)

[Full Screen Example](http://itemslide.github.io/examples/fullscreen_navigation/)

<br/>
<img src="http://itemslide.github.io/website-src/Tested.svg" style="height:250px;"/>
<br/>


### Dependencies
- [jQuery](http://jquery.com/)
- [Hammer.js](http://hammerjs.github.io/)


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
- start - index of slide that appears when initializing {default: 0}

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

### Easings

Currently the only (and default) easing is easeOutQuart.