var carousel;
var itemslide;

window.addEventListener("load", () => {
    var element = document.querySelector("#scrolling ul");
    itemslide = new Itemslide(element, {
        swipe_out: true
    });
});

window.addEventListener("resize", () => {
    itemslide.reload();
});

