function spool() {
    const DEFAULT_WPM = 200;

   var getUserPreference = function(label) {
        return window.localStorage.getItem(label);
    }

    var setUserPreference = function(key, value) {
        return window.localStorage.setItem(key, value);
    };

    var defaultWpm = function() {
        if (getUserPreference('spool-wpm')) {
            return getUserPreference('spool-wpm');
        } else {
            return DEFAULT_WPM;
        }
    };

    var spool = { };

    var _workingPane = spool.workingPane = $('<div id="workingPane" class="spool-read-box">'); // give it the same class as the main readbox to ensure any font attributes are the same
    _workingPane.css('display', 'block');
    _workingPane.css('visibility', 'hidden');
    _workingPane.css('z-index', -1);
    _workingPane.css('position', 'fixed');
    _workingPane.css('top', -100);
    $(document.body).append(_workingPane);

    var naturalPairAdjustment = function(pos, word, pair) {
        if (pos > 0 && word[pos] === pair[1] && word[pos-1] === pair[0]) {
            return 1;
        } else {
            return 0;
        }
    }

    var _fudgeORama = function (pos, word) {
        var wLength = word.replace(/\W$/g, '').length;
        if (wLength < 4) {
            return pos;
        }

        var offset = 0;

        if (word.length > 7) {
            offset = 1;
        }
        if (word.length > 10) {
            offset = 2;
        }

        offset += naturalPairAdjustment(pos - offset, word, 'ou');
        offset += naturalPairAdjustment(pos - offset, word, 'ie');
        offset += naturalPairAdjustment(pos - offset, word, 'gh');
        offset += naturalPairAdjustment(pos - offset, word, 'ph');
        offset += naturalPairAdjustment(pos - offset, word, 'th');

        return pos - offset;
    };

    var buildOlpWord = function(word) {
        var wholeWordContainer = $('<span>');
        wholeWordContainer.text(word.replace(/\W/g, ''));
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
        style.html('.spool-read-box{font-size:2em;z-index:2;position:fixed;height:2.5em;width:10em;font-family:sans}.spool-read-box p{padding:0;display:inline}.spool-read-box .marker{height:.75em;padding:0;width:50%;border-right:1px solid red}.spool-read-box .container{width:100%;display:inline-block;background-color:#fff}.spool-read-box .controls{background-color:#fff;opacity:0;font-size:.5em;width:80%;padding-left:10%;padding-right:10%}.spool-read-box:hover .controls{opacity:1}.spool-read-box .controls .navigation-preview{padding:0 .1em}.spool-read-box .controls .control-group{display:inline-block;padding:1%}.spool-read-box .navigation-preview{font-size:.5em}.olp,.spool-read-box .controls .navigation-preview.on{color:red}');
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
        increaseDelayForTrickyWord: function(word) {
            var shouldDelay = false;

            shouldDelay |= word === 'I';
            var this_function = arguments.callee;
            shouldDelay |= (this_function.previousWord && this_function.previousWord.length === word.length)
            this_function.previousWord = word;

            if (shouldDelay) {
                this.pause();
                window.setTimeout(this.resume.bind(this), spool.wordDuration/5);
            }
        },
        displayWord: function(word) {

            var previousTextHolder = this.contentArea.find('p').last();
            if (previousTextHolder) {
                previousTextHolder.remove();
            }

            var newWordData = buildOlpWord(word);
            var textHolder = newWordData.element
            textHolder.insertBefore($('.marker', this.contentArea).last());

            var center = textHolder.parent().offset().left + (textHolder.parent().width() / 2);
            textHolder.offset( { left: center - newWordData.offset } );
        },
        spoolNextWord: function() {

            var word = this.words[this.nextWordIndex++];
            this.displayWord(word);
            this.increaseDelayForTrickyWord(word);

            if (this.nextWordIndex >= this.words.length) {
                this.finishedCallback();
            }
        },

        pause: function() {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        },

        stop: function() {
            this.pause();
            this.hide();
            this.active = false;
        },

        resume: function() {
            if (!this.intervalId && this.active) {
                this.intervalId = window.setInterval(this.spoolNextWord.bind(this), spool.wordDuration);
            }
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
            this.active = true;
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
        var wpmControls = $('<div class="control-group">');
        var wpmLabel = $('<span>wpm:</span>');
        var wpmSetting = $('<select>');

        for (var i = 150; i < 800; i += 50) {
            wpmSetting.append($('<option>').text(i).prop('selected', i == defaultWpm()));
        }

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

        _readBox.contentArea.append(beforeWord).append(afterWord);

        var navigationMouseEventData = { used: true };


        var offset = function(mouseEvent) {
            if (mouseEvent) {
                var distance = Math.floor((navigationMouseEventData.startingX - mouseEvent.screenX) / 10);
                return distance;
            } else {
                return 0;
            }
        };

        var showTargetWord = function(event) {
            var howFar = 0;
            if (!navigationMouseEventData.used) {
                howFar = offset(event);
                beforeWord.show();
                afterWord.show();
            } else {
                return;
            }

            var newNextWordIndex = Math.min(Math.max(_readBox.nextWordIndex - 1 - howFar, 0), _readBox.words.length - 1);

            beforeIndex = newNextWordIndex - 1;
            afterIndex = newNextWordIndex + 1;

            var word = _readBox.words[newNextWordIndex];
            _readBox.displayWord(word);

            beforeWord.text(beforeIndex >= 0 ? _readBox.words[beforeIndex] : '');
            afterWord.text(afterIndex < _readBox.words.length ? _readBox.words[afterIndex] : '');

            var displayWordPosition = displayWord().offset();

            beforeWord.offset({top: displayWordPosition.top + displayWord().height() / 2, left: displayWordPosition.left - beforeWord.width()})
            afterWord.offset({top: displayWordPosition.top + displayWord().height() / 2, left: displayWordPosition.left + displayWord().width()})
        };

        var goBackOnMouseUp = function(event) {
            try {
                if (!navigationMouseEventData.used) {
                    navigationMouseEventData.cancelCallbacks();            

                    var howFar = offset(event);

                    navigationMouseEventData.used = true;

                    _readBox.active = navigationMouseEventData.readBoxActive;

                    beforeWord.hide();
                    afterWord.hide();

                    goBack(howFar);
                }
            } catch (e) {
                console.log(e);
            }
        };

        wordContainer
            .mousedown(function(event) {
                if(event.target.id = 'display-word') {
                    event.preventDefault();
                    navigationMouseEventData.startingX = event.screenX;
                    navigationMouseEventData.used = false;
                    navigationMouseEventData.readBoxActive = _readBox.active;
                    _readBox.active = false;

                    navigationMouseEventData.cancelCallbacks = function() {
                        $(document).unbind('mouseup.spool-navigation');
                        $(document).unbind('mousemove.spool-navigation');
                    };

                    $(document).bind('mouseup.spool-navigation', goBackOnMouseUp);
                    $(document).bind('mousemove.spool-navigation', showTargetWord);
                    showTargetWord();
                }
            });

    })();

    var setWpm = function(wpm) {
        if (wpm === 'default') {
            defaultWpm();
        }
        spool.wordDuration = (1000*60)/wpm;
        setUserPreference('spool-wpm', wpm);
    }

    var showMaskedParagraph = function() {
        spool.maskedParagraph.fadeTo('fast', 1);
        spool.maskedParagraph = null;
    };

    (function() {
        var stopReadingControl = $('<div class="control-group">');
        var stopReadingButton = $('<button>');
        stopReadingButton.html('&#x25A0;');
        stopReadingControl.append(stopReadingButton);
        spool.controls.append(stopReadingControl);
        
        stopReadingButton.click(function() {
            _readBox.stop();
            showMaskedParagraph();
        });
    })();

    (function() {
        var autoMoveToNextParagraphControls = $('<div class="control-group">');
        var autoMoveToNextParagraphToggle = $('<input type="checkbox">');
        var autoMoveToNextParagraphLabel = $('<label>').text('continuous spool:');
        autoMoveToNextParagraphControls
             .append(autoMoveToNextParagraphLabel)
             .append(autoMoveToNextParagraphToggle);
        spool.autoMoveNextParagraph = getUserPreference('spool-auto-read-next');
        autoMoveToNextParagraphToggle.prop('checked', spool.autoMoveNextParagraph);
        spool.controls.append(autoMoveToNextParagraphControls);
        
        autoMoveToNextParagraphToggle.click(function() {
            spool.autoMoveNextParagraph = $(this).is(':checked');
            setUserPreference('spool-auto-read-next', spool.autoMoveNextParagraph);
        });
    })();


    _readBox.contentArea.hover(_readBox.pause.bind(_readBox), _readBox.resume.bind(_readBox));

    var maskParagraph = function(paragraphNode) {
        spool.maskedParagraph = paragraphNode;
        paragraphNode.fadeTo('fast', 0.5);
    }

    var sanitizeText = window.sane = function(text) {
        var sane = text.trim();
        
        // if a word appears twice, it won't display well. Insert a comma for readability
        sane = sane.replace(/\b(\w+)\s+(\1)\b/g, '$1, $2');

        // get rid of dodgey double-hyphenation
        sane = sane.replace(/(\w+)(\W)(\2+)(\w+)/g, '$1 $2 $4');
        sane = sane.replace(/([^\w\.])(\1+)/g, '$1 ');
        
        // split hypenated words
        sane = sane.replace(/(\w)([-:@])(\w+)/g, '$1$2 $3');
        sane = sane.replace(/(\w{2,})([^\w\s])(\w{2,})/g, '$1 $2 $3');

        // try to split long words according to natural rules
        sane = sane.replace(/(\w{7,})([aeiou]\w{3,})\b/g, '$1- $2');
        sane = sane.replace(/(\w{4,})(\W)(\w{2,})/g, '$1 $2 $3');

        // split any remaining big words
        sane = sane.replace(/(\w{6,})(\w{5,})\b/g, '$1- $2');
        return sane;
    };

    var ensureCoordinatesOnScreen = function(coords, margin) {
        var scrollBottom = $(window).scrollTop() + $(window).height();

        if (coords.top + margin > scrollBottom) {
            $(window).scrollTop(coords.top - $(window).height() + margin);
        }
    };

    var _readParagraph = spool.read = function(paragraphNode, dontMoveDisplay) {

        if (paragraphNode.closest(_readBox.contentArea).length > 0) {
            return; // don't accept requests targeted at our own content area
        }

        _readBox.pause();
        if (spool.maskedParagraph) {
            showMaskedParagraph(); 
        }
        maskParagraph(paragraphNode);

        var sanitizedText = sanitizeText(paragraphNode.text());

        var paragraphPosition = paragraphNode.offset();
        var paragraphMid = { top: paragraphPosition.top + paragraphNode.height() / 2, left: paragraphPosition.left + paragraphNode.width() / 2 };

        ensureCoordinatesOnScreen(paragraphMid, _readBox.contentArea.height() * 1.1);

        if (!dontMoveDisplay) {
            _readBox.show(paragraphMid);
        }

        _readBox.start(
                sanitizedText.split(/\s/g).filter(
                    function(word) { return !word.match(/^\s*$/g); }), 
                function() {
                    showMaskedParagraph();
                    if (spool.autoMoveNextParagraph) {
                        var nextParagraph = paragraphNode.next();
                        if (nextParagraph && nextParagraph.text()) {
                            spool.read(nextParagraph, true);
                            return;
                        }
                    } 

                    _readBox.stop();
                });
    }

    setWpm(defaultWpm());

    return spool;
}
