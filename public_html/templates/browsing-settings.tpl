<div class="messages"></div>

<form class="form-wrapper browsing-settings">
	<div class="form-row">
		<label class="form-label">Safety:</label>
		<div class="form-input">
			<input <% print(settings.listPosts.safe ? 'checked="checked"' : '') %> type="checkbox" id="browsing-settings-safety-safe" name="listSafePosts" value="safe"/>
			<label for="browsing-settings-safety-safe">
				Safe
			</label>

			<input <% print(settings.listPosts.sketchy ? 'checked="checked"' : '') %> type="checkbox" id="browsing-settings-safety-sketchy" name="listSketchyPosts" value="sketchy"/>
			<label for="browsing-settings-safety-sketchy">
				Sketchy
			</label>

			<input <% print(settings.listPosts.unsafe ? 'checked="checked"' : '') %> type="checkbox" id="browsing-settings-safety-unsafe" name="listUnsafePosts" value="unsafe"/>
			<label for="browsing-settings-safety-unsafe">
				Unsafe
			</label>
		</div>
	</div>

	<div class="form-row">
		<label class="form-label" for="browsing-settings-endless-scroll">Endless scroll:</label>
		<div class="form-input">
			<input <% print(settings.endlessScroll ? 'checked="checked"' : '') %> type="checkbox" id="browsing-settings-endless-scroll" name="endlessScroll"/>
			<label for="browsing-settings-endless-scroll">
				Enabled
			</label>
		</div>
	</div>

	<div class="form-row">
		<label class="form-label" for="browsing-settings-hide-downvoted">Hide down-voted:</label>
		<div class="form-input">
			<input <% print(settings.hideDownvoted ? 'checked="checked"' : '') %> type="checkbox" id="browsing-settings-hide-downvoted" name="hideDownvoted"/>
			<label for="browsing-settings-hide-downvoted">
				Enabled
			</label>
		</div>
	</div>

	<div class="form-row">
		<label class="form-label"></label>
		<div class="form-input">
			<button type="submit">Update settings</button>
		</div>
	</div>
</form>


