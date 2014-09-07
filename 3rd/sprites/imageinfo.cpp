/*
ImageInfo.CPP
Implementation of the imageinfo class
*/
#include "imageinfo.h"

ImageInfo::ImageInfo() {

}
ImageInfo::ImageInfo(QImage image, int positionX, int positionY, QString Name, QString State)
{
	QRegExp regex("^(.*)-(.*)");
	int ind = regex.indexIn(Name);
	if(ind > -1)
	{
		_name = regex.cap(1);
		_namewithsize = Name;
	}
	else
	{
		_name = Name;
		_namewithsize = Name;
	}
	_image = image;
	_x = positionX;
	_y= positionY;

	_state = State;
}

ImageInfo::~ImageInfo()
{

}

QImage ImageInfo::Image()
{
	return _image;
}
int ImageInfo::PositionX()
{
	return _x;
}
int ImageInfo::PositionY()
{
	return _y;
}
QString ImageInfo::Name()
{
	return _name;
}

QString ImageInfo::NameWithSize()
{
	return _namewithsize;
}

QString ImageInfo::State()
{
	return _state;
}

void ImageInfo::setPosition(int x, int y){
	_x=x;
	_y=y;
}