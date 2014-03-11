
const WORD_DURATION = 1000*60/100

function scrollLogToBottom() {
	var logBox = $('#log');
	logBox.scrollTop(logBox.prop('scrollHeight'));
}

function log(msg) {
	var logBox = $('#log');
	var newText = $("<p>").text(msg);
	var diff = logBox.prop('scrollTop') - logBox.prop('scrollHeight') + logBox.height();
	var shouldScrollToBottom = diff === 0;
	logBox.append(newText);
	if (shouldScrollToBottom) {
		scrollLogToBottom();
	}
	if (!_log_visible) {
		hideLog();
	}
}

var _log_visible = true;

function hideLog() {
	var logBox = $('#log');
	var lastP = logBox.children('p').last();
	
	logBox.offset( { top: lastP.outerHeight(true) - logBox.height() } );
	scrollLogToBottom();
	
	_log_visible = false;
}

function showLog() {
	var logBox = $('#log');
	logBox.offset( { top: 0 } );
	scrollLogToBottom();
	_log_visible = true;
}

function toggleShowLog() {
	if (_log_visible) {
		hideLog();
	} else {
		showLog();
	}
}

var _workingPane = null;

function getWorkingPane() {
	if (!_workingPane) {
		_workingPane = $('<div id="workingPane">');
		_workingPane.css('display', 'block');
		_workingPane.css('visibility', 'hidden');
		_workingPane.css('z-index', -1);
		_workingPane.css('position', 'fixed');
		_workingPane.css('top', -100);
		
		$(document.body).append(_workingPane);
	}
	
	return _workingPane
}

var _readBox = null;

function getReadBox() {
	if (!_readBox) {
		_readBox = $('<div id="readBox">');
		_readBox.append($('<div class="marker left">'))
		_readBox.append($('<div class="marker left">'))
		_readBox.click(cancelCurrentSpool)
		$(document.body).append(_readBox);
	}
	return _readBox;
}

function fudgeORama(pos, word) {
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
}

function buildOlpWord(word) {
	var wholeWordContainer = $('<span>');
	wholeWordContainer.text(word);
	var workingPane = getWorkingPane();
	workingPane.append(wholeWordContainer);
	
	var wordBuildupContainer = $('<span>');
	workingPane.append(wordBuildupContainer);
	var widthBeforeAddingLetter = 0;
	var letterWidth = 0;
	var positionInWord = 0;
	for (positionInWord = 0; positionInWord < word.length && wordBuildupContainer.width() < wholeWordContainer.width() / 2; ++positionInWord) {
		widthBeforeAddingLetter = wordBuildupContainer.width();
		wordBuildupContainer.text(wordBuildupContainer.text() + word[positionInWord]);
		letterWidth = wordBuildupContainer.width() - widthBeforeAddingLetter;
	}
	positionInWord--;
	positionInWord = fudgeORama(positionInWord, word);
	
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
}

function spoolWord() {
	var readBox = getReadBox();
	var previousTextHolder = readBox.children('p').last();
	if (previousTextHolder) {
		previousTextHolder.remove();
	}
	var state = readBox.data('state');
	var word = state.words[state.index++];
	
	var newWordData = buildOlpWord(word);
	var textHolder = newWordData.element
	textHolder.insertBefore($('.marker', readBox).last());
	
	var center = readBox.offset().left + (readBox.width() / 2);
	textHolder.offset( { left: center - newWordData.offset } );
	
	
	if (state.index < state.wordCount) {
		spool();
	} else {
		cancelCurrentSpool();
	}
}

var _current_paragraph = null;

function spool() {
	var readBox = getReadBox();
	readBox.data('currentSpoolingId', window.setTimeout(spoolWord, WORD_DURATION));
}

function spoolNow() {
	spoolWord();
}

function cancelCurrentSpool() {
	var readBox = getReadBox();
	if (readBox) {
		if (readBox.data('currentSpoolingId')) {
			window.clearTimeout(readBox.data('currentSpoolingId'));
		}
		if (_current_paragraph) {
			_current_paragraph.fadeTo('fast', 1);
		}
		readBox.hide();
	}
}

function read(jqElement) {
	
	var readBox = getReadBox();
	cancelCurrentSpool();
	jqElement.fadeTo('fast', 0.5);
	
	readBox.data('reading_text', jqElement.text());
	var state = { 
		index: 0, 
		words: jqElement.text().trim().split(/\s/g)
	};
	state.wordCount = state.words.length;
	readBox.data('state', state);
	_current_paragraph = jqElement;
	readBox.show();
	
	var paragraphPosition = jqElement.offset();
	var paragraphMid = { top: paragraphPosition.top + jqElement.height() / 2, left: paragraphPosition.left + jqElement.width() / 2 };
	
	var alignReadBoxOffset = { 
		up: readBox.outerHeight(true) / 2, 
		left: readBox.width() / 2 
	};
	
	readBox.offset({ top: paragraphMid.top - alignReadBoxOffset.up, left: paragraphMid.left - alignReadBoxOffset.left });
	
	spoolNow();
}

$('#content').click(function(event) { 
	var target = $(event.target);
	if (target.prop('tagName') === 'P') {
		read(target);
	}
});

$('#log').click(function(event) {
	toggleShowLog();
});