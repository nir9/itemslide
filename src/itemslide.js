//Vendor prefixes - ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ]
//about:flags


var prefix = (function () { //get prefix of client browser
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
  };*/
})();



(function ($) {


    /*var globalID;

function repeatOften() {
  $("<div />").appendTo("body");
  globalID = requestAnimationFrame(repeatOften);
}

$("#start").on("click", function() {
  globalID = requestAnimationFrame(repeatOften);
});

$("#stop").on("click", function() {
  cancelAnimationFrame(globalID);
});*/


    var accel = 0;
    var overallslide = 0;
    var sensitivity = 10;
    var slides;
    var currentIndex = 0;
    var settings;
    var initialLeft;
    var currentLandPos = 0;
    var slidesGlobalID;



    //Easing stuff

    var currentPos = 0;
    var begin=0;
    var targetFrame;
    var countFrames = 0;

    //Waypoints check position relative to waypoint and decide if to scroll to or not...
    $.fn.initslide = function (options) {



        var defaults = {
            duration: 300,
            pan_sensitivity: 10,
            swipe_sensitivity: 250
        };

        settings = $.extend({}, defaults, options);


        slides = $(this); //Saves the object given to the plugin in a variable

        initialLeft = slides.css("left").replace("px", "");
        console.log("initialLeft: " + initialLeft);
        console.log(slides.css("width"));

        slides.css('transform', 'translate3d(0px,0px, 0px)'); // transform according to vendor prefix

        gotoSlideByIndex(0);

        console.log("prefix: " + prefix);



        $('li:nth-child(' + (currentIndex + 1) + ')').attr('id', 'active');

        var mc = new Hammer(slides.get(0)); //Retrieve DOM Elements to create hammer.js object
        var disable = false;

        /*slides.css("-webkit-transition", "0s");
        slides.css("-moz-transition", "0s");
        slides.css("-ms-transition", "0s");
        slides.css("transition", "0s");*/

        mc.on("panleft panright", function (ev) { //Hammerjs pan(drag) event happens very fast
            /*console.log(ev.deltaX);

            console.log(slides.css("transform"));
            var matrix = matrixToArray(slides.css("transform"));
            var value = parseInt(matrix[4]);
            console.log(value);*/

            //            console.log();
            /*if (!disable) {*/


                slides.css('transform', 'translate3d(' + (ev.deltaX + currentLandPos) + 'px' + ',0px, 0px)'); // transform according to vendor prefix
cancelAnimationFrame(slidesGlobalID);

            /*} else {

                console.log("AWDADASDASDASDASDASDASD");

                disable = false;
            }*/
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


    function gotoSlideByIndex(i)
    {

        changeActiveSlideTo(i);
        /*slides.css("left","+="-i*slides.children('li').css("width").replace("px",""));*/

        //MUCH WOW!!!
        /*slides.animate({
            left: -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2)),
            useTranslate3d: true,leaveTransforms:true
        }, settings.duration, 'easeOutQuart');*/

        var coordinate = -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2));

        /*slides.css({
				transform: 'translate3d(' + coordinate + 'px' + ',0px, 0px)',
				WebkitTransition : '0.3s ease-in-out',
                MozTransition    : '0.3s ease-in-out',
                MsTransition     : '0.3s ease-in-out',
                OTransition      : '0.3s ease-in-out',
                transition       : '0.3s ease-in-out',

			});*/
            var matrix = matrixToArray(slides.css("transform"));
            var value = parseFloat(matrix[4]);
            console.log(value);

currentPos=value;

        currentLandPos = -(i * slides.children('li').css("width").replace("px", "") - (($("html").css("width").replace("px", "") - initialLeft - slides.children('li').css("width").replace("px", "")) / 2)); //HHMMMMMMMM
        console.log(currentLandPos + "ccc");




        //counter=0;
        /*repeatOften();*/
        //begin = currentPos;
        countFrames=0;
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
            currentPos -= easeOutQuart(countFrames,0,currentPos-currentLandPos,settings.duration);//work!! BEGIN = 0
            //to understand easing refer to: http://upshots.org/actionscript/jsas-understanding-easing
            if(currentPos == currentLandPos)
            {
                console.log("out of loop");
                countFrames=0;
            return; //out of recursion
            }
            //console.log("So Animate!");
            //            currentPos-=increment;
//            console.log("inc" + increment);
            //time



        slides.css('transform', 'translate3d(' + (currentPos) + 'px' + ',0px, 0px)'); // transform according to vendor prefix

        slidesGlobalID = requestAnimationFrame(repeatOften);
    }



    function easeOutQuart(t, b, c, d) {
        t /= d;
        t--;
        return -c * (t * t * t * t - 1) + b;
    }

})(jQuery);
