// ==UserScript==
// @description Insert speed-reading widget into any page
// @match <all_urls>
// @name spool
// @namespace com.jameselford.scripts
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require https://raw.github.com/jelford/spool/a2a2945494fa9c9acb1cd3d26f0fde27bc0f3593/spool.js
// @version 0.1.7_0
// @grant none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

$(document.body).click((function(spool) {
    return function(event) {
        if (event.altKey) {
            var target = $(event.target);
            spool.read(target);
        }
    };
})(spool())
);
