var carousel;
let element;

window.addEventListener("load", () => {
    element = document.querySelector("#scrolling ul");
    const itemslide = new Itemslide(element, {
        swipe_out: true
    });
});

window.addEventListener("resize", () => {
    element.reload();
});

