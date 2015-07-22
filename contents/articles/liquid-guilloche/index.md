---
title: Liquid Guilloché
date: '2015-07-22'
author: binarymax
template: article.jade
tags: [art,javascript]
---

Having recently read a blog post on guilloches[1], I became intrigued and the post inspired me to recreate them.  They are beautiful patterns, and the starting formula to draw a rosette looked very simple to replicate in an HTML5 canvas.  The 30 minute project quickly took off into a several hour excursion into the beauty of animated guilloches.

---

##A Simple Rosette

The formula for the basic rosette guilloche is not something you would stumble upon when playing around with graphics.  It is elegant and simple, and if you have a basic understanding of graphing trigonometry equations you can grasp it without difficulty.  In the physical world, a layperson would recognise it as a spirograph[2].

```javascript
	Math.tau = Math.tau||(Math.PI*2);
	var rosette = function(image,R,r,p,step) {
		var rr = R+r;
		var rp = r+p;
		var rrr = (R+r)/r;
		for(var theta=0,x=0,y=0;theta<Math.tau;theta+=step) {
			x = Math.round(rr*Math.cos(theta) + rp*Math.cos(rrr*theta));
			y = Math.round(rr*Math.sin(theta) - rp*Math.sin(rrr*theta));
			image.putPixel(x,y,color(theta));
		}
		return image;
	}

```
...Where *image* is a canvas abstraction that exposes a putPixel method and *color()* is a function that returns an RGBA object.  Here is the result:

<canvas id="rosette"></canvas>


A nice benefit of expressing a mathematical construct in code, is that you can iterate the variables over a range to animate.  Clicking on the above starts the animation.

---

##A Knee

By changing the formula of the original, we can create new and interesting forms.  This example changes the formula slightly by calculating a tangent in place of a sine.

<canvas id="knee"></canvas>

---

##A River

By changing the formula of the original, we can create new and interesting forms.
<canvas id="river"></canvas>

---

##Combining forms

We can easily combine two or more forms to the same canvas.  Here is 'Ribbon', 'Cross', and 'Rosette' together.

<canvas id="multi1"></canvas>

---

##Try it out!

The code is all available here: https://github.com/binarymax/guilloche

---

[1] http://ministryoftype.co.uk/words/article/guilloches/

[2] https://en.wikipedia.org/wiki/Spirograph

<script type="text/javascript" src="/javascripts/pixels.js"></script>
<script type="text/javascript" src="/javascripts/guilloche.js"></script>