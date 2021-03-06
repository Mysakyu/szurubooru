var App = App || {};
App.Controls = App.Controls || {};

App.Controls.TagInput = function($underlyingInput) {
	var _ = App.DI.get('_');
	var jQuery = App.DI.get('jQuery');
	var promise = App.DI.get('promise');
	var api = App.DI.get('api');
	var tagList = App.DI.get('tagList');

	var KEY_RETURN = 13;
	var KEY_SPACE = 32;
	var KEY_BACKSPACE = 8;
	var tagConfirmKeys = [KEY_RETURN, KEY_SPACE];
	var inputConfirmKeys = [KEY_RETURN];

	var SOURCE_INITIAL_TEXT = 1;
	var SOURCE_AUTOCOMPLETION = 2;
	var SOURCE_PASTE = 3;
	var SOURCE_IMPLICATIONS = 4;
	var SOURCE_INPUT_BLUR = 5;
	var SOURCE_INPUT_ENTER = 6;
	var SOURCE_SUGGESTIONS = 7;

	var tags = [];
	var options = {
		beforeTagAdded: null,
		beforeTagRemoved: null,
		inputConfirmed: null,
	};

	var $wrapper = jQuery('<div class="tag-input">');
	var $tagList = jQuery('<ul class="tags">');
	var $input = jQuery('<input class="tag-real-input" type="text"/>');
	var $siblings = jQuery('<div class="related-tags"><span>Sibling tags:</span><ul>');
	var $suggestions = jQuery('<div class="related-tags"><span>Suggested tags:</span><ul>');
	init();
	render();
	initAutoComplete();

	function init() {
		if ($underlyingInput.length === 0) {
			throw new Error('Tag input element was not found');
		}
		if ($underlyingInput.length > 1) {
			throw new Error('Cannot set tag input to more than one element at once');
		}
		if ($underlyingInput.attr('data-tagged')) {
			throw new Error('Tag input was already initialized for this element');
		}
		$underlyingInput.attr('data-tagged', true);
	}

	function render() {
		$underlyingInput.hide();
		$wrapper.append($tagList);
		$wrapper.append($input);
		$wrapper.insertAfter($underlyingInput);
		$wrapper.click(function(e) {
			if (e.target.nodeName === 'LI') {
				return;
			}
			e.preventDefault();
			$input.focus();
		});
		$input.attr('placeholder', $underlyingInput.attr('placeholder'));
		$siblings.insertAfter($wrapper);
		$suggestions.insertAfter($wrapper);

		processText($underlyingInput.val(), SOURCE_INITIAL_TEXT);

		$underlyingInput.val('');
	}

	function initAutoComplete() {
		var autoComplete = new App.Controls.AutoCompleteInput($input);
		autoComplete.onDelete = function(text) {
			removeTag(text);
			$input.val('');
		};
		autoComplete.onApply = function(text) {
			processText(text, SOURCE_AUTOCOMPLETION);
			$input.val('');
		};
		autoComplete.additionalFilter = function(results) {
			return _.filter(results, function(resultItem) {
				return !_.contains(getTags(), resultItem[0]);
			});
		};
		autoComplete.onRender = function($list) {
			$list.find('li').each(function() {
				var $li = jQuery(this);
				if (isTaggedWith($li.attr('data-key'))) {
					$li.css('opacity', '0.5');
				}
			});
		};
	}

	$input.bind('focus', function(e) {
		$wrapper.addClass('focused');
	});
	$input.bind('blur', function(e) {
		$wrapper.removeClass('focused');
		var tagName = $input.val();
		addTag(tagName, SOURCE_INPUT_BLUR);
		$input.val('');
	});

	$input.bind('paste', function(e) {
		e.preventDefault();
		var pastedText;
		if (window.clipboardData) {
			pastedText = window.clipboardData.getData('Text');
		} else {
			pastedText = (e.originalEvent || e).clipboardData.getData('text/plain');
		}

		if (pastedText.length > 2000) {
			window.alert('Pasted text is too long.');
			return;
		}

		processTextWithoutLast(pastedText, SOURCE_PASTE);
	});

	$input.bind('keydown', function(e) {
		if (_.contains(inputConfirmKeys, e.which) && !$input.val()) {
			e.preventDefault();
			if (typeof(options.inputConfirmed) !== 'undefined') {
				options.inputConfirmed();
			}
		} else if (_.contains(tagConfirmKeys, e.which)) {
			var tagName = $input.val();
			e.preventDefault();
			$input.val('');
			addTag(tagName, SOURCE_INPUT_ENTER);
		} else if (e.which === KEY_BACKSPACE && jQuery(this).val().length === 0) {
			e.preventDefault();
			removeLastTag();
		}
	});

	function explodeText(text) {
		return _.filter(text.trim().split(/\s+/), function(item) {
			return item.length > 0;
		});
	}

	function processText(text, source) {
		var tagNamesToAdd = explodeText(text);
		_.map(tagNamesToAdd, function(tagName) { addTag(tagName, source); });
	}

	function processTextWithoutLast(text, source) {
		var tagNamesToAdd = explodeText(text);
		var lastTagName = tagNamesToAdd.pop();
		_.map(tagNamesToAdd, function(tagName) { addTag(tagName, source); });
		$input.val(lastTagName);
	}

	function addTag(tagName, source) {
		tagName = tagName.trim();
		if (tagName.length === 0) {
			return;
		}

		if (tagName.length > 64) {
			//showing alert inside keydown event leads to mysterious behaviors
			//in some browsers, hence the timeout
			window.setTimeout(function() {
				window.alert('Tag is too long.');
			}, 10);
			return;
		}

		if (isTaggedWith(tagName)) {
			flashTagRed(tagName);
		} else {
			beforeTagAdded(tagName, source);

			var exportedTag = getExportedTag(tagName);
			if (!exportedTag || !exportedTag.banned) {
				tags.push(tagName);
				var $elem = createListElement(tagName);
				$tagList.append($elem);
			}

			afterTagAdded(tagName, source);
		}
	}

	function beforeTagRemoved(tagName) {
		if (typeof(options.beforeTagRemoved) === 'function') {
			options.beforeTagRemoved(tagName);
		}
	}

	function afterTagRemoved(tagName) {
		refreshShownSiblings();
	}

	function beforeTagAdded(tagName, source) {
		if (typeof(options.beforeTagAdded) === 'function') {
			options.beforeTagAdded(tagName);
		}
	}

	function afterTagAdded(tagName, source) {
		if (source === SOURCE_IMPLICATIONS) {
			flashTagYellow(tagName);
		} else if (source !== SOURCE_INITIAL_TEXT) {
			var tag = getExportedTag(tagName);
			if (tag) {
				_.each(tag.implications, function(impliedTagName) {
					if (!isTaggedWith(impliedTagName)) {
						addTag(impliedTagName, SOURCE_IMPLICATIONS);
					}
				});
				if (source !== SOURCE_IMPLICATIONS && source !== SOURCE_SUGGESTIONS) {
					showOrHideSuggestions(tagName);
					refreshShownSiblings();
				}
			} else {
				flashTagGreen(tagName);
			}
		}
	}

	function getExportedTag(tagName) {
		return _.first(_.filter(
			tagList.getTags(),
			function(t) {
				return t.name.toLowerCase() === tagName.toLowerCase();
			}));
	}

	function removeTag(tagName) {
		var oldTagNames = getTags();
		var newTagNames = _.without(oldTagNames, tagName);
		if (newTagNames.length !== oldTagNames.length) {
			beforeTagRemoved(tagName);
			setTags(newTagNames);
			afterTagRemoved(tagName);
		}
	}

	function isTaggedWith(tagName) {
		var tagNames = _.map(getTags(), function(tagName) {
			return tagName.toLowerCase();
		});
		return _.contains(tagNames, tagName.toLowerCase());
	}

	function removeLastTag() {
		removeTag(_.last(getTags()));
	}

	function flashTagRed(tagName) {
		flashTag(tagName, 'rgba(255, 200, 200, 1)');
	}

	function flashTagYellow(tagName) {
		flashTag(tagName, 'rgba(255, 255, 200, 1)');
	}

	function flashTagGreen(tagName) {
		flashTag(tagName, 'rgba(200, 255, 200, 1)');
	}

	function flashTag(tagName, color) {
		var $elem = getListElement(tagName);
		$elem.css({backgroundColor: color});
	}

	function getListElement(tagName) {
		return $tagList.find('li[data-tag="' + tagName.toLowerCase() + '"]');
	}

	function setTags(newTagNames) {
		tags = newTagNames.slice();
		$tagList.empty();
		$underlyingInput.val(newTagNames.join(' '));
		_.each(newTagNames, function(tagName) {
			var $elem = createListElement(tagName);
			$tagList.append($elem);
		});
	}

	function createListElement(tagName) {
		var $elem = jQuery('<li/>');
		$elem.attr('data-tag', tagName.toLowerCase());

		var $tagLink = jQuery('<a class="tag">');
		$tagLink.text(tagName + ' ' /* for easy copying */);
		$tagLink.click(function(e) {
			e.preventDefault();
			showOrHideSiblings(tagName);
			showOrHideSuggestions(tagName);
		});
		$elem.append($tagLink);

		var $deleteButton = jQuery('<a class="close"><i class="fa fa-remove"></i></a>');
		$deleteButton.click(function(e) {
			e.preventDefault();
			removeTag(tagName);
			$input.focus();
		});
		$elem.append($deleteButton);
		return $elem;
	}

	function showOrHideSuggestions(tagName) {
		var tag = getExportedTag(tagName);
		var suggestions = tag ? tag.suggestions : [];
		updateSuggestions($suggestions, suggestions);
	}

	function showOrHideSiblings(tagName) {
		if ($siblings.data('lastTag') === tagName && $siblings.is(':visible')) {
			$siblings.slideUp('fast');
			$siblings.data('lastTag', null);
			return;
		}

		promise.wait(getSiblings(tagName), promise.make(function(resolve, reject) {
			$siblings.slideUp('fast', resolve);
		})).then(function(siblings) {
			siblings = _.pluck(siblings, 'name');
			$siblings.data('lastTag', tagName);
			$siblings.data('siblings', siblings);
			updateSuggestions($siblings, siblings);
		}).fail(function() {
		});
	}

	function refreshShownSiblings() {
		updateSuggestions($siblings, $siblings.data('siblings'));
	}

	function updateSuggestions($target, suggestedTagNames) {
		function filterSuggestions(sourceTagNames) {
			if (!sourceTagNames) {
				return [];
			}
			var tagNames = _.filter(sourceTagNames.slice(), function(tagName) {
				return !isTaggedWith(tagName);
			});
			tagNames = tagNames.slice(0, 20);
			return tagNames;
		}

		function attachTagsToSuggestionList($list, tagNames) {
			$list.empty();
			_.each(tagNames, function(tagName) {
				var $li = jQuery('<li>');
				var $a = jQuery('<a href="#/posts/query=' + tagName + '">');
				$a.text(tagName);
				$a.click(function(e) {
					e.preventDefault();
					addTag(tagName, SOURCE_SUGGESTIONS);
					$li.fadeOut('fast', function() {
						$li.remove();
						if ($list.children().length === 0) {
							$list.parent('div').slideUp('fast');
						}
					});
				});
				$li.append($a);
				$list.append($li);
			});
		}

		var suggestions = filterSuggestions(suggestedTagNames);
		if (suggestions.length > 0) {
			attachTagsToSuggestionList($target.find('ul'), suggestions);
			$target.slideDown('fast');
		} else {
			$target.slideUp('fast');
		}
	}

	function getSiblings(tagName) {
		return promise.make(function(resolve, reject) {
			promise.wait(api.get('/tags/' + tagName + '/siblings'))
				.then(function(response) {
					resolve(response.json.data);
				}).fail(function() {
					reject();
				});
		});
	}

	function getTags() {
		return tags;
	}

	function focus() {
		$input.focus();
	}

	function hideSuggestions() {
		$siblings.hide();
		$suggestions.hide();
		$siblings.data('siblings', []);
	}

	_.extend(options, {
		setTags: setTags,
		getTags: getTags,
		removeTag: removeTag,
		addTag: addTag,
		focus: focus,
		hideSuggestions: hideSuggestions,
	});
	return options;
};
