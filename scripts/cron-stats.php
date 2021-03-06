<?php
require_once(__DIR__
	. DIRECTORY_SEPARATOR . '..'
	. DIRECTORY_SEPARATOR . 'src'
	. DIRECTORY_SEPARATOR . 'Bootstrap.php');

// Why this exists:
// 1. Some entities store a few basic stats in special columns for performance reasons. The benefit of such
//    denormalization is vast.
// 2. The maintenance of the stats is implemented using triggers - when users tags a post, tag usage increases.
// 3. This mostly works.
// 4. Meanwhile, in order not to leave any orphans upon row deletions (e.g. have dangling postTags row after specific
//    post removal), the database schema uses foreign keys with CASCADE option. This option recursively removes
//    everything that would have missing references. This is good.
// 5. Here's the thing: row removals caused by CASCADE foreign key checks don't execute triggers. So if user removes a
//    post, then although corresponding postTags entries will get deleted, ON postTags AFTER DELETE trigger will not
//    execute, leaving the tags with invalid usage count.
//
// There are three possible solutions to this problem:
// 1. Implement all that logic in the appplication layer. I don't feel like doing this at all, it causes more havoc in
//    the code and possibly adds even more holes to the whole denormalization maintenance process.
// 2. Convert CASCADE foreign checks to another set of triggers. This won't work for MySQL because of its limitations:
//    >Can't update table 'comments' in stored function/trigger because it is already used by statement which invoked
//    >this stored function/trigger
//    Creating complex triggers will result very quickly in this error message (I tested it on postTags and posts, it
//    did). I strongly believe the reason behind the error above is linked directly into the discussed MySQL's
//    limitation.
// 3. Make a scripts like this. This is the easiest option out. The downside is that changes will be seen not
//    immediately, but except for heavy tag maintenance, I don't see where such a delay in stat synchronization might
//    really hurt.

use Szurubooru\DatabaseConnection;
$databaseConnection = Szurubooru\Injector::get(DatabaseConnection::class);
$pdo = $databaseConnection->getPDO();
$pdo->exec('UPDATE tags SET usages = (SELECT COUNT(1) FROM postTags WHERE tagId = tags.id)');
$pdo->exec('UPDATE posts SET tagCount = (SELECT COUNT(1) FROM postTags WHERE postId = posts.id)');
$pdo->exec('UPDATE posts SET score = (SELECT SUM(score) FROM scores WHERE postId = posts.id)');
$pdo->exec('UPDATE posts SET favCount = (SELECT COUNT(1) FROM favorites WHERE postId = posts.id)');
$pdo->exec('UPDATE posts SET lastFavTime = (SELECT MAX(time) FROM favorites WHERE postId = posts.id)');
$pdo->exec('UPDATE posts SET commentCount = (SELECT COUNT(1) FROM comments WHERE postId = posts.id)');
$pdo->exec('UPDATE posts SET lastCommentTime = (SELECT MAX(lastEditTime) FROM comments WHERE postId = posts.id)');
