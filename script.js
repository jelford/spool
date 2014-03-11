


function _spool() {
    const DEFAULT_WPM = 200;

    var spool = { };

    var _workingPane = spool.workingPane = $('<div id="workingPane" class="spool-read-box">'); // give it the same class as the main readbox to ensure any font attributes are the same
    _workingPane.css('display', 'block');
    _workingPane.css('visibility', 'hidden');
    _workingPane.css('z-index', -1);
    _workingPane.css('position', 'fixed');
    _workingPane.css('top', -100);
    $(document.body).append(_workingPane);

    var _fudgeORama = function (pos, word) {
        var wLength = word.length;
        if (wLength < 4) {
            return pos;
        }

        var offset = 0

        for (var lookBack = 0; lookBack<2 && pos - lookBack >= 0; ++lookBack) {
            if ("acemnorsuvwxyz".contains(word[pos-lookBack])) {
                offset = lookBack;
            }
        }

        return pos - offset;
    };

    var buildOlpWord = function(word) {
        var wholeWordContainer = $('<span>');
        wholeWordContainer.text(word);
        var workingPane = _workingPane
        workingPane.append(wholeWordContainer);

        var wordBuildupContainer = $('<span>');
        workingPane.append(wordBuildupContainer);
        var widthBeforeAddingLetter = 0;
        var letterWidth = 0;
        var positionInWord;
        for (positionInWord = 0; positionInWord < word.length && wordBuildupContainer.width() < wholeWordContainer.width() / 2; ++positionInWord) {
            widthBeforeAddingLetter = wordBuildupContainer.width();
            wordBuildupContainer.text(wordBuildupContainer.text() + word[positionInWord]);
            letterWidth = wordBuildupContainer.width() - widthBeforeAddingLetter;
        }
        positionInWord--;
        positionInWord = _fudgeORama(positionInWord, word);

        wholeWordContainer.remove();
        wordBuildupContainer.remove();

        var wordDisplay = $('<p id="display-word">')
        workingPane.append(wordDisplay);
        var beforeOlpLetters = $('<span>')
        beforeOlpLetters.text(word.substring(0, positionInWord));
        wordDisplay.append(beforeOlpLetters);
        var olpLetter = $('<span class="olp">')
        olpLetter.text(word[positionInWord]);
        wordDisplay.append(olpLetter);
        var afterOlpLetters = $('<span>');
        afterOlpLetters.text(word.substring(positionInWord+1));
        wordDisplay.append(afterOlpLetters);

        var offset = beforeOlpLetters.width() + olpLetter.width() / 2;

        wordDisplay.remove();

        return { offset: offset, element: wordDisplay };
    };

    var buildReadBox = function() {
        var style = $('<style type="text/css">')
        style.html('.spool-read-box{font-size:2em;z-index:2;position:absolute;height:2.5em;width:10em;font-family:sans}.spool-read-box p{padding:0;display:inline}.spool-read-box .marker{height:.75em;padding:0;width:50%;border-right:1px solid red}.spool-read-box .container{width:100%;display:inline-block;background-color:#fff}.spool-read-box .controls{background-color:#fff;opacity:0;font-size:.5em;width:80%;padding-left:10%;padding-right:10%}.spool-read-box:hover .controls{opacity:1}.spool-read-box .controls .navigation-preview{padding:0 .1em}.olp,.spool-read-box .controls .navigation-preview.on{color:red}');
        $(document.body).append(style);

        var controls = spool.controls = $('<div class="controls">');

        var contentArea = $('<div id="spool-read-box" class="spool-read-box">')
            .append($('<div class="container">')
            .append($('<div class="marker">'))
            .append($('<div class="marker">')))
            .append(controls).hide();

        return contentArea;
    }

    var _readBox = spool.readBox = {
        contentArea: buildReadBox(),
        nextWordIndex: 0,
        words: [],
        intervalId: null,
        spoolNextWord: function() {
            var previousTextHolder = this.contentArea.find('p').last();
            if (previousTextHolder) {
                previousTextHolder.remove();
            }

            var word = this.words[this.nextWordIndex++];

            var newWordData = buildOlpWord(word);
            var textHolder = newWordData.element
            textHolder.insertBefore($('.marker', this.contentArea).last());

            var center = textHolder.parent().offset().left + (textHolder.parent().width() / 2);
            textHolder.offset( { left: center - newWordData.offset } );

            if (this.nextWordIndex >= this.words.length) {
                this.pause();
                window.setTimeout(this.stop.bind(this), 500); // leave a before closing the last word, to avoid a nasty jarring
            }
        },

        pause: function() {
            window.clearInterval(this.intervalId);
        },

        stop: function() {
            this.pause();
            this.hide();
            if (this.finishedCallback) {
                this.finishedCallback();
            }
        },

        resume: function() {
            this.intervalId = window.setInterval(this.spoolNextWord.bind(this), spool.wordDuration);
        },

        hide: function() {
            this.contentArea.hide('fast');
        },

        start: function(words, finishedCallback) {
            this.words = words.slice(0);
            if (this.words.length == 0) {
                return;
            }
            this.nextWordIndex = 0;
            this.spoolNextWord();
            this.intervalId = window.setInterval(this.spoolNextWord.bind(this), spool.wordDuration);
            this.finishedCallback = finishedCallback;
        },

        show: function(targetMidPoint) {
            this.contentArea.show();

            var alignReadBoxOffset = {
                up: this.contentArea.outerHeight(true) / 2,
                left: this.contentArea.width() / 2
            };

            this.contentArea.offset({ top: targetMidPoint.top - alignReadBoxOffset.up, left: targetMidPoint.left - alignReadBoxOffset.left });
        }
    };

    $(document.body).append(_readBox.contentArea);

    (function() {
        var wpmControls = $('<div class="wpmControls">');
        var wpmLabel = $('<span>wpm:</span>');
        var wpmSetting = $('<select><option>default</option><option>100</option><option>200</option><option>250</option><option>300</option><option>350</option><option>400</option><option>450</option><option>500</option></select>')
        wpmControls.append(wpmLabel).append(wpmSetting);
        wpmSetting.change(function() {
            setWpm(wpmSetting.val());
        });

        spool.controls.append(wpmControls);
    })();

    (function() {

        var goBack = function(howFar) {
            _readBox.nextWordIndex = Math.min(Math.max(_readBox.nextWordIndex - howFar, 0), _readBox.words.length-1);
        };

        var wordContainer = _readBox.contentArea.children('.container');
        var displayWord = function() { return $('#display-word', wordContainer); };

        var beforeWord = $('<span class="navigation-preview before">');
        var afterWord = $('<span class="navigation-preview after">');

        spool.controls.append(beforeWord).append(afterWord);

        var navigationMouseEventData = { used: true };


        var offset = function(mouseEvent) {
            return navigationMouseEventData.startingX - mouseEvent.screenX;
        }


        var showTargetWord = function(event) {
            var howFar = 0;
            if (!navigationMouseEventData.used) {
                howFar = offset(event);
            }

            beforeIndex = _readBox.nextWordIndex-2 - howFar;
            afterIndex = _readBox.nextWordIndex - howFar;

            beforeWord.text(beforeIndex >= 0 ? _readBox.words[beforeIndex] : '');
            displayWord().text(_readBox.words[_readBox.nextWordIndex-1 - howFar]);
            afterWord.text(afterIndex < _readBox.words.length ? _readBox.words[afterIndex] : '');

            var displayWordPosition = displayWord().offset();

            beforeWord.offset({top: displayWordPosition.top + displayWord().height() / 2, left: displayWordPosition.left - beforeWord.width()})
            afterWord.offset({top: displayWordPosition.top + displayWord().height() / 2, left: displayWordPosition.left + displayWord().width()})
        }

        var goBackOnMouseUp = function(event) {
            event.preventDefault();
            if (!navigationMouseEventData.used) {
                var howFar = offset(event);
                goBack(Math.floor(howFar));
                navigationMouseEventData.used = true;
            }
            $(document).unbind('mouseup', this);
            $(document).unbind('mousemove', showTargetWord);
        }

        wordContainer
            .mousedown(function(event) {
                if(event.target.id = 'display-word') {
                    event.preventDefault();
                    navigationMouseEventData.startingX = event.screenX;
                    navigationMouseEventData.used = false;
                    $(document).mouseup(goBackOnMouseUp.bind(goBackOnMouseUp));
                    $(document).mousemove(showTargetWord.bind(showTargetWord));
                }
            });

    })();

    var setWpm = function(wpm) {
        if (wpm === 'default') {
            if (window.localStorage['spool-wpm']) {
                wpm = window.localStorage['spool-wpm'];
            } else {
                wpm = DEFAULT_WPM;
            }
        }
        spool.wordDuration = (1000*60)/wpm;
        window.localStorage.setItem('spool-wpm', wpm);
    }

    var showParagraphCallback = function(paragraph) {
        return function() {
            paragraph.fadeTo('fast', 1);
        }
    }

    _readBox.contentArea.children('.container').last().click(function(event) {
        if (event.id !== 'display-word') { // don't close if the actual word was clicked
            _readBox.stop();
            _readBox.hide();
        }
    });

    _readBox.contentArea.hover(_readBox.pause.bind(_readBox), _readBox.resume.bind(_readBox));

    var maskParagraph = function(paragraphNode) {
        spool.maskedParagraph = paragraphNode;
        paragraphNode.fadeTo('fast', 0.5);
    }

    var sanitizeText = function(text) {
        var sane = text.trim();
        sane = sane.replace(/(\s\w+)(\W)(\2+)(\w+\s)/g, '$1 $2 $4');
        return sane;
    }

    var _readParagraph = spool.read = function(paragraphNode) {

        if (paragraphNode.closest(_readBox.contentArea).length > 0) {
            return; // don't accept requests targeted at our own content area
        }

        _readBox.stop();
        maskParagraph(paragraphNode);

        var sanitizedText = sanitizeText(paragraphNode.text());

        var paragraphPosition = paragraphNode.offset();
        var paragraphMid = { top: paragraphPosition.top + paragraphNode.height() / 2, left: paragraphPosition.left + paragraphNode.width() / 2 };

        _readBox.show({top: paragraphMid.top, left: paragraphMid.left});
        _readBox.start(sanitizedText.split(/\s/g).filter(function(word) { return !word.match(/^\s*$/g); }), showParagraphCallback(paragraphNode));
    }

    setWpm('default');

    return spool;
}

$(document.body).click((function(spool) {
        return function(event) {
            var target = $(event.target);
            //if (target.prop('tagName') === 'P') {
                spool.read(target);
            //}
        };
    })(_spool())
);
