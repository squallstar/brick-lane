# Brick Lane

_Lightweight Cascading grid layout library_

Brick Lane is a jQuery plugin to place elements in optimal position based on available vertical space, like fitting bricks in a wall.

The project is trying to create a lightweight, scalable version of the famous **Masonry** plugin.

---

## Usage

First, include the **Brick Lane** plugin right after **jQuery** to get started.

+ [jquery.brick-lane.min.js](https://github.com/squallstar/brick-lane/blob/master/src/jquery.brick-lane.min.js)

Then, simply as

```javascript
$('.mycontainer').brickLane();
```
   
Where you container has a structure similar to:

```html
<div class="mycontainer">
	<div class="item">1</div>
	<div class="item">2</div>
	<div class="item">3</div>
	<div class="some-other-item">4</div>
</div>
```

---

## Options

### ``columnWidth``

By default, **Brick Lane** will use the width of your first element as **column size**.

If you wish to adjust the column size, you can pass the ``columnWidth`` option to the plugin as a ``number`` or a ``function`` that should return a number:
	
```javascript
// As a number
$('.mycontainer').brickLane({
    columnWidth: 350
});

// Or as a function
$('.mycontainer').brickLane({
    columnWidth: function(){
    	return 350;
    }
});
```

---

### ``itemSelector``

By default, **Brick Lane** will use the ``first level children`` as initial items to be added to the instance. You can amend the behaviour by passing a **jQuery selector** as ``itemSelector`` option:
	
```javascript
$('.mycontainer').brickLane({
    itemSelector: 'article'
});
```

---

### ``isResizeBound``

Binds layout to window resizing (defaults to true)
	
```javascript
$('.mycontainer').brickLane({
    isResizeBound: false
});
```

---

## Methods

You can access the instance anytime by calling it like:

```javascript
$('.mycontainer').brickLane();
```

Methods can be called by passing the method name as first argument, following parameters after that. Please check the methods here below.

### append (element)

Appends and lay outs the given element to the instance.

```javascript
var newEl = $('.some-article');

$('.mycontainer').brickLane('append', newEl);
```

---

### appended (element)

If you have your own way (perhaps a framework) to add elements to the DOM, you can just tell the plugin to lay out the item by using the ``appended`` method instead.

```javascript
var newEl = $('.some-article');

$('.mycontainer').append(newEl);

$('.mycontainer').brickLane('appended', newEl);
```

---

### layout

Force the layout of all elements.

```javascript
$('.mycontainer').brickLane('layout');
```

---

### destroy

Destroys the instance and reposition all items like they were before.

```javascript
$('.mycontainer').brickLane('destroy');
```