spool
=====

Embeddable JS library to add a speed-read box to your page.

I'm not a developer, just give it to me
---------------------------------------

If you're on Firefox and you have GreaseMonkey installed, just click [here](https://raw.github.com/jelford/spool/master/spool.user.js) and click on all the boxes that say things like "enable" or "confirm."

developers
==========

dependencies
------------

Sorry. At the moment, you'll need `$ = jQuery` in the global scope. Also, spool directly accesses the dom. 

usage
-----

Just import `spool.js` at the end of your document (or in your head, or wherever you feel like really), and set up a shim like in `index.html` to create an instance of `spool` and call through to `.read()`

Take a look at `index.html` to see how easy it is to embed spool in your page.
