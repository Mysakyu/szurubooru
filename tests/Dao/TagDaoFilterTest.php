<?php
namespace Szurubooru\Tests\Dao;
use Szurubooru\Dao\TagDao;
use Szurubooru\Entities\Tag;
use Szurubooru\Search\Filters\TagFilter;
use Szurubooru\Search\Requirements\Requirement;
use Szurubooru\Search\Requirements\RequirementSingleValue;
use Szurubooru\Search\Requirements\RequirementCompositeValue;
use Szurubooru\Search\Result;
use Szurubooru\Tests\AbstractDatabaseTestCase;

final class TagDaoFilterTest extends AbstractDatabaseTestCase
{
	public function testCategories()
	{
		$tag1 = self::getTestTag('test 1');
		$tag2 = self::getTestTag('test 2');
		$tag3 = self::getTestTag('test 3');
		$tag2->setCategory('misc');
		$tag3->setCategory('other');
		$tagDao = $this->getTagDao();
		$tagDao->save($tag1);
		$tagDao->save($tag2);
		$tagDao->save($tag3);

		$searchFilter = new TagFilter();
		$requirement = new Requirement();
		$requirement->setType(TagFilter::REQUIREMENT_CATEGORY);
		$requirement->setValue(new RequirementSingleValue('misc'));
		$requirement->setNegated(true);
		$searchFilter->addRequirement($requirement);
		$result = $tagDao->findFiltered($searchFilter);
		$this->assertEquals(2, $result->getTotalRecords());
		$this->assertEntitiesEqual([$tag3, $tag1], array_values($result->getEntities()));
	}

	public function testCompositeCategories()
	{
		$tag1 = self::getTestTag('test 1');
		$tag2 = self::getTestTag('test 2');
		$tag3 = self::getTestTag('test 3');
		$tag2->setCategory('misc');
		$tag3->setCategory('other');
		$tagDao = $this->getTagDao();
		$tagDao->save($tag1);
		$tagDao->save($tag2);
		$tagDao->save($tag3);

		$searchFilter = new TagFilter();
		$requirement = new Requirement();
		$requirement->setType(TagFilter::REQUIREMENT_CATEGORY);
		$requirement->setValue(new RequirementCompositeValue(['misc', 'other']));
		$requirement->setNegated(true);
		$searchFilter->addRequirement($requirement);
		$result = $tagDao->findFiltered($searchFilter);
		$this->assertEquals(1, $result->getTotalRecords());
		$this->assertEntitiesEqual([$tag1], array_values($result->getEntities()));
	}

	private function getTagDao()
	{
		return new TagDao($this->databaseConnection);
	}
}
