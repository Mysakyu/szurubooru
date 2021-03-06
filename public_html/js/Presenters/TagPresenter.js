var App = App || {};
App.Presenters = App.Presenters || {};

App.Presenters.TagPresenter = function(
	_,
	jQuery,
	util,
	promise,
	auth,
	api,
	tagList,
	router,
	keyboard,
	topNavigationPresenter,
	messagePresenter) {

	var $el = jQuery('#content');
	var $messages = $el;
	var templates = {};
	var implicationsTagInput;
	var suggestionsTagInput;

	var tag;
	var posts;
	var siblings;

	var privileges = {};

	function init(params, loaded) {
		topNavigationPresenter.select('tags');
		topNavigationPresenter.changeTitle('Tags');

		privileges.canChangeName = auth.hasPrivilege(auth.privileges.changeTagName);
		privileges.canChangeCategory = auth.hasPrivilege(auth.privileges.changeTagCategory);
		privileges.canChangeImplications = auth.hasPrivilege(auth.privileges.changeTagImplications);
		privileges.canChangeSuggestions = auth.hasPrivilege(auth.privileges.changeTagSuggestions);
		privileges.canBan = auth.hasPrivilege(auth.privileges.banTags);
		privileges.canViewHistory = auth.hasPrivilege(auth.privileges.viewHistory);
		privileges.canDelete = auth.hasPrivilege(auth.privileges.deleteTags);
		privileges.canMerge = auth.hasPrivilege(auth.privileges.mergeTags);
		privileges.canViewPosts = auth.hasPrivilege(auth.privileges.viewPosts);

		promise.wait(
				util.promiseTemplate('tag'),
				util.promiseTemplate('post-list-item'),
				util.promiseTemplate('history'))
			.then(function(tagTemplate, postListItemTemplate, historyTemplate) {
				templates.tag = tagTemplate;
				templates.postListItem = postListItemTemplate;
				templates.history = historyTemplate;

				reinit(params, loaded);
			}).fail(function() {
				console.log(arguments);
				loaded();
			});
	}

	function reinit(params, loaded) {
		var tagName = params.tagName;

		messagePresenter.hideMessages($messages);

		promise.wait(
				api.get('tags/' + tagName),
				api.get('tags/' + tagName + '/siblings'),
				api.get('posts', {query: tagName}))
			.then(function(tagResponse, siblingsResponse, postsResponse) {
				tag = tagResponse.json;
				siblings = siblingsResponse.json.data;
				posts = postsResponse.json.data;
				posts = posts.slice(0, 8);

				render();
				loaded();

				renderPosts(posts);
			}).fail(function(tagResponse, siblingsResponse, postsResponse) {
				messagePresenter.showError($messages, tagResponse.json.error || siblingsResponse.json.error || postsResponse.json.error);
				loaded();
			});
	}

	function render() {
		$el.html(templates.tag({
			privileges: privileges,
			tag: tag,
			siblings: siblings,
			tagCategories: JSON.parse(jQuery('head').attr('data-tag-categories')),
			util: util,
			historyTemplate: templates.history,
		}));
		$el.find('.post-list').hide();
		$el.find('form').submit(function(e) { e.preventDefault(); });
		$el.find('form button[name=update]').click(updateButtonClicked);
		$el.find('form button[name=delete]').click(deleteButtonClicked);
		$el.find('form button[name=merge]').click(mergeButtonClicked);
		implicationsTagInput = App.Controls.TagInput($el.find('[name=implications]'));
		suggestionsTagInput = App.Controls.TagInput($el.find('[name=suggestions]'));
	}

	function updateButtonClicked(e) {
		e.preventDefault();
		var $form = $el.find('form');
		var formData = {};

		if (privileges.canChangeName) {
			formData.name = $form.find('[name=name]').val();
		}

		if (privileges.canChangeCategory) {
			formData.category = $form.find('[name=category]:checked').val();
		}

		if (privileges.canBan) {
			formData.banned = $form.find('[name=ban]').is(':checked') ? 1 : 0;
		}

		if (privileges.canChangeImplications) {
			formData.implications = implicationsTagInput.getTags().join(' ');
		}

		if (privileges.canChangeSuggestions) {
			formData.suggestions = suggestionsTagInput.getTags().join(' ');
		}

		promise.wait(api.put('/tags/' + tag.name, formData))
			.then(function(response) {
				router.navigateInplace('#/tag/' + response.json.name);
				tagList.refreshTags();
			}).fail(function(response) {
				window.alert(response.json && response.json.error || 'An error occured.');
			});
	}

	function deleteButtonClicked(e) {
		if (!window.confirm('Are you sure you want to delete this tag?')) {
			return;
		}
		promise.wait(api.delete('/tags/' + tag.name))
			.then(function(response) {
				router.navigate('#/tags');
				tagList.refreshTags();
			}).fail(function(response) {
				window.alert(response.json && response.json.error || 'An error occured.');
			});
	}

	function mergeButtonClicked(e) {
		var targetTag = window.prompt('What tag should this be merged to?');
		if (targetTag) {
			promise.wait(api.put('/tags/' + tag.name + '/merge', {targetTag: targetTag}))
				.then(function(response) {
					router.navigate('#/tags');
					tagList.refreshTags();
				}).fail(function(response) {
					window.alert(response.json && response.json.error || 'An error occured.');
				});
		}
	}

	function renderPosts(posts) {
		var $target = $el.find('.post-list ul');
		_.each(posts, function(post) {
			var $post = jQuery('<li>' + templates.postListItem({
				util: util,
				post: post,
				query: {query: tag.name},
				canViewPosts: privileges.canViewPosts,
			}) + '</li>');
			$target.append($post);
		});
		if (posts.length > 0) {
			$el.find('.post-list').fadeIn();
			keyboard.keyup('p', function() {
				$el.find('.post-list a').eq(0).focus();
			});
		}
	}

	return {
		init: init,
		reinit: reinit,
	};

};

App.DI.register('tagPresenter', [
	'_',
	'jQuery',
	'util',
	'promise',
	'auth',
	'api',
	'tagList',
	'router',
	'keyboard',
	'topNavigationPresenter',
	'messagePresenter'],
App.Presenters.TagPresenter);
