// ==UserScript==
// @description Insert speed-reading widget into any page
// @match <all_urls>
// @name spool
// @namespace com.jameselford.scripts
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require https://raw.github.com/jelford/spool/fd91c5ba84bf64be586d81c6806bc707f26e19b4/spool.js
// @version 0.1.7_2
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
