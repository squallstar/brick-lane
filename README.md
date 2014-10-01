# Brick Lane

_Lightweight Cascading grid layout library_

Brick Lane is a jQuery plugin to place elements in optimal position based on available vertical space, like fitting bricks in a wall.

The project is trying to create a lightweight, scalable version of the famous **Masonry** plugin.

---

## Usage

First, include the **Brick Lane** plugin right after **jQuery** to get started.

+ [jquery.brick-lane.min.js](https://github.com/squallstar/brick-lane/blob/master/src/jquery.brick-lane.min.js)

Then, simply as

    $('.mycontainer').brickLane();
   
Where you container has a structure similar to:

    <div class="mycontainer">
    	<div class="item">1</div>
    	<div class="item">2</div>
    	<div class="item">3</div>
    	<div class="some-other-item">4</div>
    </div>

By default, **Brick Lane** will use the width of your first element as **column size**.

If you wish to adjust the column size, you can pass the ``columnWidth`` option to the plugin as a ``number`` or a ``function`` that should return a number:
	
```javascript
// As a number
$('.mycontainer').brickLane({
    columnWidth: 350
});

Or as a function
$('.mycontainer').brickLane({
    columnWidth: function(){
    	return 350;
    }
});
```
