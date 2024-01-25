var itemslide;

window.addEventListener("load", () => {

    var element = document.querySelector("#scrolling ul");

    itemslide = new Itemslide(element, {
        swipe_out: true, // NOTE: REMOVE THIS OPTION IF YOU WANT TO DISABLE THE SWIPING SLIDES OUT FEATURE.
    });
});
