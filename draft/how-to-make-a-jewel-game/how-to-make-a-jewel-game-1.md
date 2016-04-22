#How to make a Jewel Game (from scratch)
##Part 1 of X

###The basics
    Before all the glamor and glory, before we can provide ourselves countless hours of entertainment with our own game, and before we can do anything at all, we need to draw a square. 

    This lonely square will be the first of many, and start us down a path to make lots and lots of squares that will make up the blocks (or jewels) in our game.

    To draw a square with Javascript in the browser, we will make use of the ```canvas``` element that comes as part of the HTML5 specification.  Don't worry if you've not used canvas before, because you're about to learn how.  First lets create a canvas element on our page, and grab a reference to it in javascript:
    
```html
<canvas id="gamecanvas"></canvas>
```
    
```javascript
var _width = 100;
var _height = 100;
var _canvas = document.getElementById("gamecanvas");
_canvas.width = _width;
_canvas.height = _height;
_canvas.style.width = _width + 'px';
_canvas.style.height = _height + 'px';
```

