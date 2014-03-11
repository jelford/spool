


function _spool() {
    const DEFAULT_WPM = 200;
    const DEFAULT_WORD_DURATION = 1000*60/DEFAULT_WPM;
    var spool = { wordDuration: DEFAULT_WORD_DURATION };

    var _workingPane = spool.workingPane = $('<div id="workingPane">');
    _workingPane.css('display', 'block');
    _workingPane.css('visibility', 'hidden');
    _workingPane.css('z-index', -1);
    _workingPane.css('position', 'fixed');
    _workingPane.css('top', -100);
    $(document.body).append(_workingPane);

    var _fudgeORama = function (pos, word) {
        var wLength = word.length;
        if (wLength < 5) {
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

        var wordDisplay = $('<p>')
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

    var _readBox = spool.readBox = {
        contentArea: $('<div id="readBox">').append($('<div class="marker">')).append($('<div class="marker">')).hide(),
        currentWordIndex: 0,
        words: [],
        intervalId: null,
        spoolNextWord: function() {
            var previousTextHolder = this.contentArea.children('p').last();
            if (previousTextHolder) {
                previousTextHolder.remove();
            }

            var word = this.words[this.currentWordIndex++];

            var newWordData = buildOlpWord(word);
            var textHolder = newWordData.element
            textHolder.insertBefore($('.marker', readBox).last());

            var center = this.contentArea.offset().left + (this.contentArea.width() / 2);
            textHolder.offset( { left: center - newWordData.offset } );

            if (this.currentWordIndex >= this.words.length) {
                this.stop();
            }
        },

        stop: function() {
            window.clearInterval(this.intervalId);
            this.contentArea.hide('fast');
        },

        start: function(words) {
            this.words = words;
            this.currentWordIndex = 0;
            this.spoolNextWord();
            this.intervalId = window.setInterval(this.spoolNextWord.bind(this), spool.wordDuration);
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

    var showMaskedParagraph = function() {
        if (spool.maskedParagraph) {
            spool.maskedParagraph.fadeTo('fast', 1);
        }
    }

    _readBox.contentArea.click(function() {
        _readBox.stop();
        showMaskedParagraph();
    });

    var maskParagraph = function(paragraphNode) {
        spool.maskedParagraph = paragraphNode;
        paragraphNode.fadeTo('fast', 0.5);
    }

    var sanitizeText = function(text) {
        var sane = text.trim();
        sane = sane.replace(/(\s\w+)(\W)(\2+)(\w+\s)/g, '$1 $2 $4');
        return sane;
    }

    var _readParagraph = spool.readParagraph = function(paragraphNode) {
        _readBox.stop();
        showMaskedParagraph();
        maskParagraph(paragraphNode);

        var sanitizedText = sanitizeText(paragraphNode.text());


        var paragraphPosition = paragraphNode.offset();
        var paragraphMid = { top: paragraphPosition.top + paragraphNode.height() / 2, left: paragraphPosition.left + paragraphNode.width() / 2 };
        _readBox.show({top: paragraphMid.top, left: paragraphMid.left});
        _readBox.start(sanitizedText.split(/\s/g));
    }

    return spool;
}

$(document.body).click((function(spool) {
        return function(event) {
            var target = $(event.target);
            if (target.prop('tagName') === 'P') {
                spool.readParagraph(target);
            }
        };
    })(_spool())
);
