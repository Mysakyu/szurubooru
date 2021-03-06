var App = App || {};
App.Presenters = App.Presenters || {};

App.Presenters.PostListPresenter = function(
	_,
	jQuery,
	util,
	promise,
	auth,
	api,
	keyboard,
	pagerPresenter,
	browsingSettings,
	topNavigationPresenter) {

	var KEY_RETURN = 13;

	var templates = {};
	var $el = jQuery('#content');
	var $searchInput;
	var privileges = {};

	var params;

	function init(_params, loaded) {
		topNavigationPresenter.select('posts');
		topNavigationPresenter.changeTitle('Posts');
		params = _params;
		params.query = params.query || {};

		privileges.canMassTag = auth.hasPrivilege(auth.privileges.massTag);
		privileges.canViewPosts = auth.hasPrivilege(auth.privileges.viewPosts);

		promise.wait(
				util.promiseTemplate('post-list'),
				util.promiseTemplate('post-list-item'))
			.then(function(listTemplate, listItemTemplate) {
				templates.list = listTemplate;
				templates.listItem = listItemTemplate;

				render();
				loaded();

				pagerPresenter.init({
						baseUri: '#/posts',
						backendUri: '/posts',
						$target: $el.find('.pagination-target'),
						updateCallback: function($page, data) {
							renderPosts($page, data.entities);
						},
					},
					function() {
						reinit(params, function() {});
					});
			}).fail(function() {
				console.log(arguments);
				loaded();
			});

		jQuery(window).on('resize', windowResized);
	}

	function reinit(_params, loaded) {
		params = _params;
		params.query = params.query || {};
		pagerPresenter.reinit({query: params.query});
		loaded();
		softRender();
	}

	function deinit() {
		pagerPresenter.deinit();
		jQuery(window).off('resize', windowResized);
	}

	function render() {
		$el.html(templates.list({
			massTag: params.query.massTag,
			privileges: privileges,
			browsingSettings: browsingSettings.getSettings()}));
		$searchInput = $el.find('input[name=query]');
		App.Controls.AutoCompleteInput($searchInput);

		$searchInput.val(params.query.query);
		$searchInput.keydown(searchInputKeyPressed);
		$el.find('form').submit(searchFormSubmitted);
		$el.find('[name=mass-tag]').click(massTagButtonClicked);
		$el.find('.safety button').click(safetyButtonClicked);

		keyboard.keyup('p', function() {
			$el.find('.posts li a').eq(0).focus();
		});

		keyboard.keyup('q', function() {
			$searchInput.eq(0).focus().select();
		});

		windowResized();
	}

	function safetyButtonClicked(e) {
		e.preventDefault();
		var settings = browsingSettings.getSettings();
		var buttonClass = jQuery(e.currentTarget).attr('class').split(' ')[0];
		var enabled = jQuery(e.currentTarget).hasClass('disabled');
		jQuery(e.currentTarget).toggleClass('disabled');
		if (buttonClass === 'safety-unsafe') {
			settings.listPosts.unsafe = enabled;
		} else if (buttonClass === 'safety-sketchy') {
			settings.listPosts.sketchy = enabled;
		} else if (buttonClass === 'safety-safe') {
			settings.listPosts.safe = enabled;
		}
		promise.wait(browsingSettings.setSettings(settings))
			.then(function() {
				reinit(params, function() {});
			}).fail(function() {
				console.log(arguments);
			});
	}

	function softRender() {
		$searchInput.val(params.query.query);

		var $massTagInfo = $el.find('.mass-tag-info');
		if (params.query.massTag) {
			$massTagInfo.show();
			$massTagInfo.find('span').text(params.query.massTag);
		} else {
			$massTagInfo.hide();
		}
		_.map($el.find('.posts .post-small'), function(postNode) { softRenderPost(jQuery(postNode).parents('li')); });
	}

	function renderPosts($page, posts) {
		var $target = $page.find('.posts');
		_.each(posts, function(post) {
			if (!shouldSkipPost(post)) {
				var $post = renderPost(post);
				softRenderPost($post);
				$target.append($post);
			}
		});
		windowResized();
	}

	function shouldSkipPost(post) {
		var settings = browsingSettings.getSettings();
		if (post.ownScore < 0 && settings.hideDownvoted) {
			return true;
		}
		if (settings.listPosts) {
			if (post.safety === 'safe' && !settings.listPosts.safe) {
				return true;
			} else if (post.safety === 'sketchy' && !settings.listPosts.sketchy) {
				return true;
			} else if (post.safety === 'unsafe' && !settings.listPosts.unsafe) {
				return true;
			}
		}
		return false;
	}

	function renderPost(post) {
		var $post = jQuery('<li>' + templates.listItem({
			util: util,
			query: params.query,
			post: post,
			canViewPosts: privileges.canViewPosts,
		}) + '</li>');
		$post.data('post', post);
		util.loadImagesNicely($post.find('img'));
		return $post;
	}

	function softRenderPost($post) {
		var classes = [];
		if (params.query.massTag) {
			var post = $post.data('post');
			if (_.contains(_.map(post.tags, function(tag) { return tag.name.toLowerCase(); }), params.query.massTag.toLowerCase())) {
				classes.push('tagged');
			} else {
				classes.push('untagged');
			}
		}
		$post.toggleClass('tagged', _.contains(classes, 'tagged'));
		$post.toggleClass('untagged', _.contains(classes, 'untagged'));
		$post.find('.action').toggle(_.any(classes));
		$post.find('.action button').text(_.contains(classes, 'tagged') ? 'Tagged' : 'Untagged').unbind('click').click(postTagButtonClicked);
	}

	function windowResized() {
		var $list = $el.find('ul.posts');
		var $posts = $list.find('.post-small');
		var $firstPost = $posts.eq(0);
		var $lastPost = $firstPost;
		for (var i = 1; i < $posts.length; i ++) {
			$lastPost = $posts.eq(i-1);
			if ($posts.eq(i).offset().left < $lastPost.offset().left) {
				break;
			}
		}
		if ($firstPost.length === 0) {
			return;
		}
		$el.find('.search').width($lastPost.offset().left + $lastPost.width() - $firstPost.offset().left);
	}

	function postTagButtonClicked(e) {
		e.preventDefault();
		var $post = jQuery(e.target).parents('li');
		var post = $post.data('post');
		var tags = _.pluck(post.tags, 'name');
		if (_.contains(_.map(tags, function(tag) { return tag.toLowerCase(); }), params.query.massTag.toLowerCase())) {
			tags = _.filter(tags, function(tag) { return tag.toLowerCase() !== params.query.massTag.toLowerCase(); });
		} else {
			tags.push(params.query.massTag);
		}
		var formData = {};
		formData.seenEditTime = post.lastEditTime;
		formData.tags = tags.join(' ');
		promise.wait(api.post('/posts/' + post.id, formData))
			.then(function(response) {
				post = response.json;
				$post.data('post', post);
				softRenderPost($post);
			}).fail(function(response) {
				window.alert(response.json && response.json.error || response);
			});
	}

	function searchInputKeyPressed(e) {
		if (e.which !== KEY_RETURN) {
			return;
		}
		updateSearch();
	}

	function massTagButtonClicked(e) {
		e.preventDefault();
		params.query.massTag = window.prompt('Enter tag to tag with:');
		pagerPresenter.setQuery(params.query);
	}

	function searchFormSubmitted(e) {
		e.preventDefault();
		updateSearch();
	}

	function updateSearch() {
		$searchInput.blur();
		params.query.query = $searchInput.val().trim();
		params.query.page = 1;
		pagerPresenter.setQuery(params.query);
	}

	return {
		init: init,
		reinit: reinit,
		deinit: deinit,
		render: render,
	};

};

App.DI.register('postListPresenter', ['_', 'jQuery', 'util', 'promise', 'auth', 'api', 'keyboard', 'pagerPresenter', 'browsingSettings', 'topNavigationPresenter'], App.Presenters.PostListPresenter);
