(function($){
    var overallslide = 0;
    var sensitivity = 10;
    var slides;
	$.fn.initslide = function (){
		
		//var target = $(this).attr('id');
		//alert(target);
        //$(this)
        
        slides = $(this);//Saves the object in a variable //.children
        //alert("children: " + slides.length);
        
        var mc = new Hammer(slides.get(0));//Retrieve DOM Elements to create hammer.js object
        
        mc.on("panleft panright", function(ev) {
            console.log(ev.velocityX +" gesture detected.");
            overallslide -= ev.velocityX*sensitivity;
            
            slides.css("margin-left",overallslide);
        });
        
	}

})(jQuery);