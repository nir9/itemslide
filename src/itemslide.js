//Vendor prefixes - ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ]
//about:flags


/*var prefix = (function () { //get prefix of client browser
    var styles = window.getComputedStyle(document.documentElement, ''),
        pre = (Array.prototype.slice
            .call(styles)
            .join('')
            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
    return pre[0].toUpperCase() + pre.substr(1) + "Transform";
    /*{
    dom: dom,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1)
  };
})(); */



(function ($) {





    var accel = 0;
    var overallslide = 0;
    var sensitivity = 10;
    var slides;
    var currentIndex = 0;
    var settings;
    var initialLeft;
    var currentLandPos = 0;
    var slidesGlobalID;





var currentPos = 0;
var begin = 0;
var targetFrame;
var countFrames = 0;

//Waypoints check position relative to waypoint and decide if to scroll to or not...
$.fn.initslide = function (options) {



    var defaults = {
        duration: 250,
        swipe_sensitivity: 250,
        disable_slide: false
    };

    settings = $.extend({}, defaults, options);


    slides = $(this); //Saves the object given to the plugin in a variable

    initialLeft = slides.css("left").replace("px", "");
    console.log("initialLeft: " + initialLeft);

    slides.css("width",slides.children('li').length*slides.children('li').css("width").replace("px",""));//SET WIDTH

    console.log(slides.css("width"));

    slides.css('transform', 'translate3d(0px,0px, 0px)'); // transform according to vendor prefix

    gotoSlideByIndex(0);

    //console.log("prefix: " + prefix);



    $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', 'active');

    var mc = new Hammer(slides.get(0)); //Retrieve DOM Elements to create hammer.js object
    var disable = false;



    mc.on("panleft panright", function (ev) { //Hammerjs pan(drag) event happens very fast




        if (!settings.disable_slide) {
            slides.css('transform', 'translate3d(' + (ev.deltaX + currentLandPos) + 'px' + ',0px, 0px)'); // transform according to vendor prefix
            slides.trigger('pan');
            cancelAnimationFrame(slidesGlobalID);
        }

    });
    mc.on("panend", function (ev) {
        if (!settings.disable_slide) {
            console.log("SD"); //PANNING HAS ENNDED
            var matrix = matrixToArray(slides.css("transform"));//prefix
            var value = parseInt(matrix[4]);
            console.log(value + "YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY");

            gotoSlideByIndex(getLandingSlideIndex(ev.velocityX * settings.swipe_sensitivity - value)); //HHEERRREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
            disable = true;
        }
    }); //WORKS!

    getLandingSlideIndex(2300);


}

$.fn.gotoSlide = function (i) {
    gotoSlideByIndex(i);
}

$.fn.next = function () { //Next slide
    gotoSlideByIndex(currentIndex + 1);
}

$.fn.previous = function () { //Next slide
    gotoSlideByIndex(currentIndex - 1);
}

$.fn.reload = function () {//Get index of active slide
    slides.css("width",slides.children('li').length*slides.children('li').css("width").replace("px",""));//SET WIDTH
    gotoSlideByIndex(currentIndex);
}

$.fn.getActiveIndex = function () {//Get index of active slide
    return currentIndex;
}

$.fn.getCurrentPos = function () {//Get index of active slide
    return currentPos;
}


function changeActiveSlideTo(i) {
    $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', '');
    currentIndex = i;
    console.log("new index: " + currentIndex);
    $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', 'active');
}

function getLandingSlideIndex(x) { //Get slide that will be selected when silding occured
    console.log("Sup");
    for (var i = 0; i < slides.children('li').length; i++) {
        //console.log(slides.children(i).css("width").replace("px","")*i);
        if (slides.children(i).css("width").replace("px", "") * i + slides.children(i).css("width").replace("px", "") / 2 > x) { /*&& slides.children(i).css("width").replace("px","")*(i+1) < x*/
            //YAY FIXED!!!
            console.log(i)
            return i;

        }

    }
    return currentIndex;
}
//console.log($('li:nth-child(' + (2)+ ')').css('width'));


function gotoSlideByIndex(i) {

    changeActiveSlideTo(i);





    var coordinate = -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2));


    var matrix = matrixToArray(slides.css("transform"));
    var value = parseFloat(matrix[4]);
    console.log(value);

    currentPos = value;

    currentLandPos = -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2)); //HHMMMMMMMM
    console.log(currentLandPos + "ccc");





    countFrames = 0;
    //MUCH WOW!!!
    slides.trigger('changeActiveItem');
    slidesGlobalID = requestAnimationFrame(repeatOften);




    console.log("tranform3dx ::: " + value);
    //console.log("left ::: " + slides.css("left"));


}

function matrixToArray(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}


function repeatOften() {

    countFrames++;
    console.log("ASDASD");



    //incrementer -= 0.003;
    currentPos -= easeOutQuart(countFrames, 0, currentPos - currentLandPos, settings.duration); //work!! BEGIN = 0
    //to understand easing refer to: http://upshots.org/actionscript/jsas-understanding-easing
    if (currentPos == currentLandPos) {
        console.log("out of loop");
        countFrames = 0;
        return; //out of recursion
    }
    //console.log("So Animate!");




    slides.css('transform', 'translate3d(' + (currentPos) + 'px' + ',0px, 0px)'); // transform according to vendor prefix

    slidesGlobalID = requestAnimationFrame(repeatOften);
}



function easeOutQuart(t, b, c, d) {
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
}

})(jQuery);
