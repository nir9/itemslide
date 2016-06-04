// Object Create
if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

// Stuff to add for compatibility with Zepto
if (!$.fn.outerWidth) {
    $.fn.outerWidth = function () {
        if ($(this)[0] instanceof Element) {
            var el = $(this)[0];
            var width = el.offsetWidth;
            var style = getComputedStyle(el);

            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            return width;
        }
    };
}
