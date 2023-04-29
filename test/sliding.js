var carousel;

window.addEventListener("load", () => {
    const element = document.querySelector("#scrolling ul");
    const itemslide = new Itemslide(element, {
        swipe_out: true
    });
});
