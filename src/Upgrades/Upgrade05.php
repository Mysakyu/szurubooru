<?php
namespace Szurubooru\Upgrades;
use Szurubooru\DatabaseConnection;

class Upgrade05 implements IUpgrade
{
	public function run(DatabaseConnection $databaseConnection)
	{
		$pdo = $databaseConnection->getPDO();
		$driver = $databaseConnection->getDriver();

		$pdo->exec('
			CREATE TABLE tags2
			(
				id INTEGER PRIMARY KEY ' . ($driver === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT') . ',
				name VARCHAR(64) UNIQUE NOT NULL,
				usages INTEGER NOT NULL DEFAULT 0
			)');
		$pdo->exec('INSERT INTO tags2(name, usages) SELECT name, (SELECT COUNT(1) FROM postTags WHERE tagName = tags.name) FROM tags');
		$pdo->exec('DROP TABLE tags');
		$pdo->exec('ALTER TABLE tags2 RENAME TO tags');

		$pdo->exec('
			CREATE TABLE postTags2
			(
				postId INTEGER NOT NULL,
				tagId INTEGER NOT NULL,
				PRIMARY KEY (postId, tagId)
			)');
		$pdo->exec('INSERT INTO postTags2(postId, tagId) SELECT postId, (SELECT tags.id FROM tags WHERE tags.name = postTags.tagName) FROM postTags');
		$pdo->exec('DROP TABLE postTags');
		$pdo->exec('ALTER TABLE postTags2 RENAME TO postTags');
	}
}
