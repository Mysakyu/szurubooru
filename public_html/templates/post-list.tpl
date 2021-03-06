<div class="post-list">
	<form class="search">
		<input type="text" name="query" placeholder="Search query..."/>
		<button type="submit" name="search">Search</button>

		<ul class="safety">
			<li>
				<button class="safety-safe <%= browsingSettings.listPosts.safe ? '' : 'disabled' %>">&nbsp;</button>
			</li>
			<li>
				<button class="safety-sketchy <%= browsingSettings.listPosts.sketchy ? '' : 'disabled' %>">&nbsp;</button>
			</li>
			<li>
				<button class="safety-unsafe <%= browsingSettings.listPosts.unsafe ? '' : 'disabled' %>">&nbsp;</button>
			</li>
		</ul>

		<% if (privileges.canMassTag) { %>
			<div class="mass-tag-wrapper">
				<p class="mass-tag-info">Tagging with <span class="mass-tag"><%= massTag %></span></p><!--
				--><button name="mass-tag">Mass tag</button>
			</div>
		<% } %>
	</form>

	<div class="pagination-target">
		<div class="wrapper">
			<ul class="posts">
			</ul>
		</div>
	</div>
</div>
