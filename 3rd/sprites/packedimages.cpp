/*
packedimages.CPP
Implementation of the packedimage class
*/
#include "packedimages.h"
#include "imageinfo.h"
#include <QPainter>

PackedImages::PackedImages(QList<ImageInfo> ImageCollection, int ContainerWidth, int ContainerHeight )
{
	_imageCollection = ImageCollection;
	_containerWidth = ContainerWidth;
	_containerHeight = ContainerHeight;
}

PackedImages::~PackedImages(){}


QList<ImageInfo> PackedImages::ImageCollection(){
return _imageCollection;

}
int PackedImages::ContainerWidth(){
return _containerWidth;

}
int PackedImages::ContainerHeight(){
	return _containerHeight;
}
