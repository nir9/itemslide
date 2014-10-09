//Vendor prefixes - ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ]

var prefix = (function () {//get prefix of client browser
  var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1],
    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
  return pre[0].toUpperCase() + pre.substr(1) + "Transform";/*{
    dom: dom,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1)
  };*/
})();

(function ($) {

    var accel = 0;
    var overallslide = 0;
    var sensitivity = 10;
    var slides;
    var currentIndex = 0;
    var settings;
    var initialLeft;
    var currentLandPos = 0;

    //Waypoints check position relative to waypoint and decide if to scroll to or not...
    $.fn.initslide = function (options) {



        var defaults = {
            duration: 350,
            pan_sensitivity: 10,
            swipe_sensitivity: 250
        };

        settings = $.extend({}, defaults, options);


        slides = $(this); //Saves the object given to the plugin in a variable

        initialLeft = slides.css("left").replace("px", "");
        console.log("initialLeft: " + initialLeft);
        console.log(slides.css("width"));


        gotoSlideByIndex(0);




        $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', 'active');

        var mc = new Hammer(slides.get(0)); //Retrieve DOM Elements to create hammer.js object
        var disable = false;
        mc.on("panleft panright", function (ev) { //Hammerjs pan(drag) event happens very fast
            console.log(ev.deltaX);

            console.log(slides.css("transform"));
            var matrix = matrixToArray(slides.css("transform"));
            var value = parseInt(matrix[4]);
            console.log(value);

            //            console.log();
            if (!disable) {


                slides.css(prefix, 'translate3d(' + (ev.deltaX + currentLandPos) + 'px' + ',0px, 0px)'); // transform according to vendor prefix


            } else {
                disable = false;
            }
        });
        mc.on("panend", function (ev) {
            console.log("SD"); //PANNING HAS ENNDED
            var matrix = matrixToArray(slides.css(prefix));
            var value = parseInt(matrix[4]);
            console.log(value + "YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY");
            gotoSlideByIndex(getLandingSlideIndex(ev.velocityX * settings.swipe_sensitivity - value));//HHEERRREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
            disable = true;
        }); //WORKS!

        getLandingSlideIndex(2300);


    }

    $.fn.gotoSlide = function (i) {
        gotoSlideByIndex(i);
    }

    $.fn.next = function () { //Next slide
        changeActiveSlideTo(currentIndex + 1);
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


    function gotoSlideByIndex(i) //TODO: not exactly centered - center the slide
    {

        changeActiveSlideTo(i);
        /*slides.css("left","+="-i*slides.children('li').css("width").replace("px",""));*/

//MUCH WOW!!!
        slides.animate({
            left: -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2)),
            useTranslate3d: true,leaveTransforms:true
        }, settings.duration, 'easeOutQuart');
        currentLandPos = -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2));//HHMMMMMMMM
        console.log(currentLandPos +"ccc");



        var matrix = matrixToArray(slides.css(prefix));
            var value = parseInt(matrix[4]);
        console.log("tranform3dx ::: " + value);
        console.log("left ::: " + slides.css("left"));


    }

    function matrixToArray(matrix) {
        return matrix.substr(7, matrix.length - 8).split(', ');
    }
})(jQuery);
