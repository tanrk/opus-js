# Introduction #

_Note: I keep trying to make an overview, but I always drill in too far._

Opus-js does some things ... differently. Below we will try to outline our methodology and explain some of our choices.

Opus-js is designed for producing web applications, that is to say, web pages that require significant interactivity with a user, much like a traditional desktop application.

Opus Composer is intended to leverage opus-js, so that developers can concentrate on building interfaces and solving application problems, instead of technology problems.

Ultimately, the goal is to have an ecosystem of Components such that for any particular problem an application developer might have, there are likely to be several choices for turnkey solutions, or at least, a basic solution to build upon.

So the problems we set out to solve from the start are the layout problem (how to aggregate objects visually) and the rendering problem (how to render complex objects to DOM quickly).

Where is the HTML? Where is the CSS? Where is the generated code?

_TODOC_

# Details #

Opus-js is designed to describe presentation with files that are (mostly) composed of javascript object notation ([JSON](http://json.org/)). We support traditional markup around and inside Opus views, but mostly the notion is to emphasize Components (aka widgets).

For the most part, you will be working with the Opus API which is hiding much of the details of DOM.

The Composer application provides visual editing of these JSON files. Add objects to the view by dragging then from the Palette and dropping them on the canvas.

Here is a snippet of code from Composer itself:

```
	saveAsAction: function() {
		this.$.saveAsEditor.setValue(this.document.filename);
		this.$.saveAsDialog.openAtCenter();
	}
```

The _this_ object here could loosely be called the _controller_. The controller maintains references to all the Components that it owns in a hash called $ (bling). To effect changes to the interface, we call methods directly on Components.

In this snippet, we set a value on an editor, and then open a dialog (presumably in response to a button or menu click that triggers _saveAsAction_).