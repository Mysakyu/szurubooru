<?php
namespace Szurubooru\Upgrades;
use Szurubooru\Dao\PostDao;
use Szurubooru\Dao\PublicFileDao;
use Szurubooru\DatabaseConnection;
use Szurubooru\Entities\Post;
use Szurubooru\Helpers\MimeHelper;
use Szurubooru\Services\PostService;

class Upgrade04 implements IUpgrade
{
	private $postDao;
	private $postService;
	private $fileDao;

	public function __construct(
		PostDao $postDao,
		PostService $postService,
		PublicFileDao $fileDao)
	{
		$this->postDao = $postDao;
		$this->postService = $postService;
		$this->fileDao = $fileDao;
	}

	public function run(DatabaseConnection $databaseConnection)
	{
		$databaseConnection->getPDO()->exec('ALTER TABLE posts ADD COLUMN contentMimeType VARCHAR(64) DEFAULT NULL');

		$posts = $this->postDao->findAll();
		foreach ($posts as $post)
		{
			if ($post->getContentType() !== Post::POST_TYPE_YOUTUBE)
			{
				$fullPath = $this->fileDao->getFullPath($post->getContentPath());
				$mime = MimeHelper::getMimeTypeFromFile($fullPath);
				$post->setContentMimeType($mime);
				$this->postDao->save($post);
			}
		}
	}
}
