(function($){
    var accel = 0;
    var overallslide = 0;
    var sensitivity = 10;
    var slides;
    var currentIndex = 0;
	$.fn.initslide = function (){
		
		//var target = $(this).attr('id');
		//alert(target);
        //$(this)
        
        slides = $(this);//Saves the object in a variable //.children
        //alert("children: " + slides.length);
        /*$( this ).children( 'li.target' ).css("border", "3px double red");*/
        //alert(slides.children.length*slides.children('li').css("width").replace("px",""));
        console.log(slides.css("width"));//TODO: solve width problem
        /*slides.css("width",slides.children.length*slides.children('li').css("width").replace("px","")*2);*/
        $('li:nth-child('+(currentIndex+1)+')').attr('id','active');
        
        var mc = new Hammer(slides.get(0));//Retrieve DOM Elements to create hammer.js object
        
        mc.on("panleft panright", function(ev) {
//            console.log(ev.velocityX +" gesture detected.");
            overallslide -= ev.velocityX*sensitivity;
            
            slides.css("left",overallslide);
        });
         mc.on("swipe", function(ev) {
//            console.log(ev.velocityX +" gesture detected.");
            accel -= ev.velocityX/100;//TODO: Solve acceleration problem
            while(accel>0)
            {
                console.log("YAYY");
                overallslide+=accel;
                slides.css("left",overallslide);
                accel-=0.001;
            }
            //slides.css("left",overallslide);
        });
        
            /*overallslide += accel;
            accel-=0.01;*/
        
	}

})(jQuery);