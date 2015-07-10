---
title: Hidden Shapes
date: '2013-08-25'
author: binarymax
template: article.jade
tags: [code,projects]
---

I am slowly working on a side-project that makes a video into a mishmash of circles for each frame.  I have an early version running, that manually takes a video, splits it into frames, remixes each frame into the circle mishmash, and recomposes the video with the new remixed frames.  The project is called 'Harissa'.  The name Harissa comes from an Armenian dish and is made from chicken and a local type of wheat.  It cooks for a long time, until it is a thick porridge.  It is a fitting name because fully rendering a video is a slow process, and the result is an interesting mishmash of the original.

---

###Harissa

The original idea for the Harissa project came from a competition I entered to recreate Mondriaan's last unfinished work (the 'Victory Boogie Woogie') with code.  My entry used an algorithm to generate a likeness of the work by randomly placing circles on a canvas, and either kept a circle if the resulting image was closer to the painting, or discarded it otherwise.  After thousands of iterations an interesting likeness emerged.  I re-purposed the algorithm for Harissas frame remixer, made use of imagemagick and mencoder for the image and video processing with a node backend, and wrote some glue code to stitch it all together.  It is a fun project and the first resulting video got some good reactions.

I want to take Harissa to the next level.  Since it uses javascript for the frame remixer, it is still quite slow (and will always be slow unless I rewrite it in CUDA or similar).  It takes about 30 seconds per frame.  When you want to generate a 5 minute video at 12 frames per second, that ends up being a big number.  I enjoy the challenges this poses.  I use web workers to speed up some operations, and will probably use some sort of websocket connection delegation to allow for multiple machines to browse to the project and each contribute to the video.  Theoretically if I use 3 machines instead of 1, it should only take a third of the time.

The main thing I am missing, however, is the choppiness between frames.  If one frame is a bunch of random circles, and the next frame is a different bunch of random circles, the transition from one frame to the next looks jarring.  With the goal of smoothing it out, I want to insert two or more new 'transition' frames, that take one frame and smoothly transition the circles to the next adjacent frame.  I have no idea how this will look in the end, and have some hurdles to jump before I can realize the result, but it is worth pursuing just to see what happens.

###Hidden Shapes
Today I jumped the first hurdle, and want to share a nice algorithm I wrote in the process.  Before we can start calculating transitions, we need to clean up the circles.  Since lots of circles are haphazardly placed on the canvas for each frame, some of them get covered up entirely and are useless in the final image.  So I needed to know whether a circle is visible when all the other circles have been drawn.  If I can get rid of the unnecessary circles I can save some time when doing later calculations.

There are at least 2 ways to do this, but probably more.  The first way is to do something called raycasting.  Imagine a beam of light shining down onto our circles - tag the first circle the beam of light hits.  Do this for every pixel on the canvas, and remove all the circles that have not been tagged.  The second way, which I eventually decided to use, is to iterate through all the circles.  For each iteration, draw the current circle with a special color, then draw all the other circles around it.  If the special color is not visible in the final slice, then it is hidden.  Either method would suffice (and there might be a better one).

Here is the code that draws the shapes to a canvas.  This code is taken from a larger module, but one can easily see that the shapes are drawn to a canvas that are not hidden, and only in the bounds we specify.  Each shape has at least the following properties: x,y,z,radius,color.  A shape is hidden if it was previously tagged as such, and is therefore ignored.  Since drawing circles is a computationally intensive process, we only want to draw the circles that might be hovering above the circle we are testing.
<pre class="prettyprint lang-javascript">
//Draws shapes to the canvas, within the specified bounds
var drawshapes = function(context,shapes,left,top,right,bottom){
	left=left||0;
	top=top||0; 
	right=right||(\_width\*\_scale);
	bottom=bottom||(\_height\*\_scale);
    for(var i=0,l=shapes.length;i&lt;l;i++) {
    	var shape = shapes[i];
    	if(!shape.hidden) {
        	var x = shape.x\*\_scale;
        	var y = shape.y\*\_scale;
        	if (x&gt;=left && y&gt;=top && x&lt;=right && y&lt;=bottom) {
	        	var r = shape.radius\*\_scale;
				context.beginPath();
				context.fillStyle = shape.color;
				context.arc(x, y, r, 0, \_360, false);
				context.closePath();
				context.fill();
			}
		}     	
   	};
};
</pre>

This is the code that tests if a specified shape is visible.  First it gets the bounds to test based on a maximum possible radius (_guessradius, set to 10 in Harissa), then it draws the shapes in those bounds using the above drawshapes function, and finally it loops through each pixel and sees if it finds any trace of our special color.  In this case I used the color r=5,g=0,b=5 (I always choose '505' for stuff because it was my fathers favorite number).  I also made sure to account for this when I am devising a palette subset for each frame.  If it senses 505, I reassign it to 515 instead, just in case.  The testvisible function returns true at the first sight of 505, so we don't waste any cycles.  If it gets through the entire section without seeing 505, it means our circle was covered up by one or more others and is therefore not visible.
 
<pre class="prettyprint lang-javascript">
//Tests if shape specified by the index is hidden, 
//  when all other shapes are rendered
var testvisible = function(context,shapes,index){
	var shape = shapes[index];
	var x = shape.x*_scale;
	var y = shape.y*_scale;
	var r = shape.radius*_scale;
	var l1 = Math.floor(x-r-1); l1=l1&lt;0?0:l1;
	var t1 = Math.floor(y-r-1); t1=t1&lt;0?0:t1;
	var d1 = Math.ceil (r*2+2);

	var l2 = Math.floor(x-_guessradius-1);
	var t2 = Math.floor(y-_guessradius-1);
	var d2 = Math.ceil (_guessradius*2+2);

	drawshapes(context,shapes,l2,t2,l2+d2,t2+d2);
	var data = context.getImageData(l1, t1, d1, d1).data;
	for(var i=0,l=data.length;i&lt;l;i+=4) {
		if (data[i]===5 && data[i+1]===0 && data[i+2]===5 && data[i+3]===255) {
				return true;
		}
	}
	return false;
};
</pre>

###Next Steps

For an average of 3000 initial circles on the canvas, this handy little algorithm removes about one third of the circles since they are hidden.  That is a great improvement!  When I need to start matching neighbor circles together between adjacent frames, this will shave off a significant amount of time in the calculation.

So now I need to jump the next hurdle - taking two adjacent frames, and doing a nearest nearest neighbor search for every circle.  Once we have that mapping we can make our transition frames to insert between the original adjacent frames.  But those will be for another day, and another post!

When the code is all done, I will post a video, but for now if you want to see the work in progress, you can view it here: https://github.com/binarymax/harissa