<?php
namespace Szurubooru\Helpers;

final class InputReader extends \ArrayObject
{
	public function __construct()
	{
		parent::setFlags(parent::ARRAY_AS_PROPS | parent::STD_PROP_LIST);

		$_PUT = [];
		if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'PUT')
			parse_str(file_get_contents('php://input'), $_PUT);

		foreach ([$_GET, $_POST, $_PUT] as $source)
		{
			foreach ($source as $key => $value)
				$this->offsetSet($key, $value);
		}
	}

	public function offsetGet($index)
	{
		if (!parent::offsetExists($index))
			return null;
		return parent::offsetGet($index);
	}

	public function readFile($fileName)
	{
		if (!isset($_FILES[$fileName]))
			return null;

		return file_get_contents($_FILES[$fileName]['tmp_name']);
	}
}
