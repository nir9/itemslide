var RAF = {};

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !RAF.requestAnimationFrame; ++x) {
    RAF.requestAnimationFrame = RAF[vendors[x]+'RequestAnimationFrame'];
    RAF.cancelAnimationFrame = RAF[vendors[x]+'CancelAnimationFrame']
        || RAF[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!RAF.requestAnimationFrame)
    RAF.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

if (!RAF.cancelAnimationFrame)
    RAF.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };