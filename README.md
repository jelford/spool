spool
=====

Embeddable JS library to add a speed-read box to your page.

I'm not a developer, just give it to me
---------------------------------------

If you're on Firefox and you have GreaseMonkey installed, just click [here](https://raw.github.com/jelford/spool/master/spool.user.js) and click on all the boxes that say things like "enable" or "confirm" or "trust."

FAQ
---

*What will happen when I install the script you just pointed me to?*

When enabled, `spool` will embed itself on any page in your browser. When you're ready to try it out, just click on any area of text, and the speed-read window will pop up, and spool through all the words. The box will always appear in the middle of the section of text, so if you can't see it, try scrolling down.

*How do I pause it?*

Just hover your mouse over the nasty words.

*What's this "wpm" thing that just popped up?*

I'm glad you asked. There, you can pick how many words you'd like displayed per minute. 500 is probably too many right now, but try turning it up to 350.

*I missed something; how do I go back?*

Click on the main word, and drag to the left.

*Isn't this all very familiar?*

It could be. It's inspired by the folks over at [spritz](http://spritzinc.com), who I think are _pretty darned clever_. The main difference is that this is in your browser, *now*, for free. I don't know when you'll be able to do that with spritz, but when you can, I'd bet you'll want to use whatever they come up with instead. They've done lots of hard work on this, and it would be very surprising if spritz wasn't way better than spool. Speed reading in this way has been about for a while though - try google.

*This all feels a bit rough around the edges.*

You're welcome to file a bug right here on github (I'll probably look at it too!). Better would be a pull request. But yes. It's rough around the edges.

*How do you find the optimal landing point when you show a new word?*

`Math.random()`. Also, there is a method named `fudgeORama`. It's not as exact as you might expect from the folks over at spritz. I hope to improve it, as there's plenty of research available on the subject, mostly accessible through the Google. Most of it's nearly 20 years old, so there's a good chance it won't be behind a journal pay-wall, if you were thinking of scripting up a pull-request?

developers
==========

dependencies
------------

Sorry. At the moment, you'll need `$ = jQuery` in the global scope. Also, spool directly accesses the dom. 

usage
-----

Just import `spool.js` at the end of your document (or in your head, or wherever you feel like really), and set up a shim like in `index.html` to create an instance of `spool` and call through to `.read()`

requirejs
---------

Great idea. I haven't done it yet. Sorry again.

Take a look at `index.html` to see how easy it is to embed spool in your page.
