# Introduction #

Each Control has both a Manager and a Parent. Each Container may have a set of controls that it manages, and a set of children (for which is is the parent). This distinction is necessary because sometimes a manager will require additional controls (_chrome_) to exist between itself and it's children.

# Details #

This arrangement results in two tree structures that describe a view. The _logical tree_ describes the management structure, and the _render tree_ describes the parent/child structure. Generally, the rendering context for children is more complex than the manager context.

For example, a Window's trees might look like this:

_logical tree:_
  * window1
    * button1
    * button2

_render tree:_
  * window1
    * header
    * leftPillar
    * rightPillar
    * footer
    * client
      * button1
      * button2


We say that _window1_ **manages** _button1_ and _button2_, but is **parent** to _header_, _leftPillar_, _rightPillar_, _footer_, and _client_.

_client_ manages no controls, but is parent to _button1_ and _button2_.

_header_, _leftPillar_, _rightPillar_, and _footer_ are Chrome objects that belong to the Window. Any particular class of Window may have it's own chrome. Chrome objects do not appear in the logical tree.

For containers, only logical trees are streamed. Render trees are a runtime concept