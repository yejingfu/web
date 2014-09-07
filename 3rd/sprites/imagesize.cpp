/*
ImageSize.CPP
Implementation of the imagesize class
*/
#include "imagesize.h"

ImageSize::~ImageSize()
{

}
ImageSize::ImageSize(QString name,int size)
{
	_name = name;
	_size = size;
}
QString ImageSize::Name()
{
	return _name;
}
int ImageSize::Size()
{
return _size;
}
