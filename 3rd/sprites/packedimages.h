#ifndef PACKEDIMAGES_H
#define PACKEDIMAGES_H

#include <QObject>
#include "imageinfo.h"
class PackedImages
{
public:
	PackedImages(QList<ImageInfo> ImageCollection, int ContainerWidth, int ContainerHeight );
	~PackedImages();

	QList<ImageInfo> ImageCollection();
	int ContainerWidth();
	int ContainerHeight();
private:
	QList<ImageInfo> _imageCollection;
	int _containerWidth;
	int _containerHeight;
};

#endif // PACKEDIMAGES_H
