<?php
class TagController extends AbstractController
{
	/**
	* @route /tags
	*/
	public static function listAction()
	{
		$this->context->subTitle = 'tags';
		throw new Exception('Not implemented');
	}
}