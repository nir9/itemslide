ItemSlide.js
===================

jQuery plugin for a touch enabled carousel

[Website](http://itemslide.github.io/)

[Full Screen Example](http://itemslide.github.io/examples/fullscreen_navigation/)

### Tested on
- iPhone 4
- iPad Mini
- Nexus 4
- LG G3


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

$("ul").initslide();

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


##### Set
- next() - goes to next slide
- previous() - goes to previous slide
- gotoSlide(i) - goes to a specific slide by index
- reload() - recalculates width and center object (recommended to call when resize occures)

```js
console.log($("ul").getActiveIndex());
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