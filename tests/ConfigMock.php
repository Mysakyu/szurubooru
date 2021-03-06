<?php
namespace Szurubooru\Tests;
use Szurubooru\Config;

final class ConfigMock extends Config
{
	public function set($key, $value)
	{
		$keys = preg_split('/[\\/]/', $key);
		$current = $this;
		$lastKey = array_pop($keys);
		foreach ($keys as $key)
		{
			if (!isset($current->$key))
				$current->$key = new \ArrayObject([], \ArrayObject::ARRAY_AS_PROPS);
			$current = $current->$key;
		}
		$current->$lastKey = $value;
	}
}
