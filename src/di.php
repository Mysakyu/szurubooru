<?php
$dataDirectory = __DIR__
	. DIRECTORY_SEPARATOR . '..'
	. DIRECTORY_SEPARATOR . 'data';

$publicDataDirectory = __DIR__
	. DIRECTORY_SEPARATOR . '..'
	. DIRECTORY_SEPARATOR . 'public_html'
	. DIRECTORY_SEPARATOR . 'data';

return [
	\Szurubooru\Config::class => DI\object()->constructor($dataDirectory, $publicDataDirectory),

	\Szurubooru\RouteRepository::class => DI\object()->constructor(DI\link('routes')),
	\Szurubooru\Upgrades\UpgradeRepository::class => DI\object()->constructor(DI\link('upgrades')),

	'upgrades' => DI\factory(function (DI\container $container) {
		return [
			$container->get(\Szurubooru\Upgrades\Upgrade00::class),
			$container->get(\Szurubooru\Upgrades\Upgrade01::class),
			$container->get(\Szurubooru\Upgrades\Upgrade02::class),
			$container->get(\Szurubooru\Upgrades\Upgrade03::class),
			$container->get(\Szurubooru\Upgrades\Upgrade04::class),
			$container->get(\Szurubooru\Upgrades\Upgrade05::class),
			$container->get(\Szurubooru\Upgrades\Upgrade06::class),
			$container->get(\Szurubooru\Upgrades\Upgrade07::class),
			$container->get(\Szurubooru\Upgrades\Upgrade08::class),
			$container->get(\Szurubooru\Upgrades\Upgrade09::class),
			$container->get(\Szurubooru\Upgrades\Upgrade10::class),
			$container->get(\Szurubooru\Upgrades\Upgrade11::class),
			$container->get(\Szurubooru\Upgrades\Upgrade12::class),
			$container->get(\Szurubooru\Upgrades\Upgrade13::class),
			$container->get(\Szurubooru\Upgrades\Upgrade14::class),
			$container->get(\Szurubooru\Upgrades\Upgrade15::class),
			$container->get(\Szurubooru\Upgrades\Upgrade16::class),
			$container->get(\Szurubooru\Upgrades\Upgrade17::class),
			$container->get(\Szurubooru\Upgrades\Upgrade18::class),
			$container->get(\Szurubooru\Upgrades\Upgrade19::class),
			$container->get(\Szurubooru\Upgrades\Upgrade20::class),
			$container->get(\Szurubooru\Upgrades\Upgrade21::class),
			$container->get(\Szurubooru\Upgrades\Upgrade22::class),
			$container->get(\Szurubooru\Upgrades\Upgrade23::class),
			$container->get(\Szurubooru\Upgrades\Upgrade24::class),
			$container->get(\Szurubooru\Upgrades\Upgrade25::class),
			$container->get(\Szurubooru\Upgrades\Upgrade26::class),
			$container->get(\Szurubooru\Upgrades\Upgrade27::class),
			$container->get(\Szurubooru\Upgrades\Upgrade28::class),
			$container->get(\Szurubooru\Upgrades\Upgrade29::class),
			$container->get(\Szurubooru\Upgrades\Upgrade30::class),
			$container->get(\Szurubooru\Upgrades\Upgrade31::class),
			$container->get(\Szurubooru\Upgrades\Upgrade32::class),
			$container->get(\Szurubooru\Upgrades\Upgrade33::class),
			$container->get(\Szurubooru\Upgrades\Upgrade34::class),
			$container->get(\Szurubooru\Upgrades\Upgrade35::class),
			$container->get(\Szurubooru\Upgrades\Upgrade36::class),
		];
	}),

	'routes' => DI\factory(function (DI\container $container) {
		return [
			$container->get(\Szurubooru\Routes\Login::class),
			$container->get(\Szurubooru\Routes\GetGlobals::class),
			$container->get(\Szurubooru\Routes\GetHistory::class),
			$container->get(\Szurubooru\Routes\Comments\AddComment::class),
			$container->get(\Szurubooru\Routes\Comments\EditComment::class),
			$container->get(\Szurubooru\Routes\Comments\DeleteComment::class),
			$container->get(\Szurubooru\Routes\Comments\GetComments::class),
			$container->get(\Szurubooru\Routes\Comments\GetPostComments::class),
			$container->get(\Szurubooru\Routes\Favorites\GetFavoriteUsers::class),
			$container->get(\Szurubooru\Routes\Favorites\AddToFavorites::class),
			$container->get(\Szurubooru\Routes\Favorites\RemoveFromFavorites::class),
			$container->get(\Szurubooru\Routes\Posts\CreatePost::class),
			$container->get(\Szurubooru\Routes\Posts\DeletePost::class),
			$container->get(\Szurubooru\Routes\Posts\FeaturePost::class),
			$container->get(\Szurubooru\Routes\Posts\GetFeaturedPost::class),
			$container->get(\Szurubooru\Routes\Posts\GetPost::class),
			$container->get(\Szurubooru\Routes\Posts\GetPostContent::class),
			$container->get(\Szurubooru\Routes\Posts\GetPostThumbnail::class),
			$container->get(\Szurubooru\Routes\Posts\GetPosts::class),
			$container->get(\Szurubooru\Routes\Posts\UpdatePost::class),
			$container->get(\Szurubooru\Routes\Posts\Notes\AddPostNote::class),
			$container->get(\Szurubooru\Routes\Posts\Notes\DeletePostNote::class),
			$container->get(\Szurubooru\Routes\Posts\Notes\GetPostNotes::class),
			$container->get(\Szurubooru\Routes\Posts\Notes\UpdatePostNote::class),
			$container->get(\Szurubooru\Routes\Tags\DeleteTag::class),
			$container->get(\Szurubooru\Routes\Tags\GetTag::class),
			$container->get(\Szurubooru\Routes\Tags\GetTagSiblings::class),
			$container->get(\Szurubooru\Routes\Tags\GetTags::class),
			$container->get(\Szurubooru\Routes\Tags\MergeTags::class),
			$container->get(\Szurubooru\Routes\Tags\UpdateTag::class),
			$container->get(\Szurubooru\Routes\Users\ActivateAccount::class),
			$container->get(\Szurubooru\Routes\Users\CreateUser::class),
			$container->get(\Szurubooru\Routes\Users\DeleteUser::class),
			$container->get(\Szurubooru\Routes\Users\FinishActivation::class),
			$container->get(\Szurubooru\Routes\Users\FinishPasswordReset::class),
			$container->get(\Szurubooru\Routes\Users\GetUser::class),
			$container->get(\Szurubooru\Routes\Users\GetUserAvatar::class),
			$container->get(\Szurubooru\Routes\Users\GetUsers::class),
			$container->get(\Szurubooru\Routes\Users\PasswordReset::class),
			$container->get(\Szurubooru\Routes\Users\UpdateUser::class),
			$container->get(\Szurubooru\Routes\Scores\GetCommentScore::class),
			$container->get(\Szurubooru\Routes\Scores\SetCommentScore::class),
			$container->get(\Szurubooru\Routes\Scores\GetPostScore::class),
			$container->get(\Szurubooru\Routes\Scores\SetPostScore::class),
		];
	}),
];
