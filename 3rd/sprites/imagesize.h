#ifndef IMAGESIZE_H
#define IMAGESIZE_H

#include <QObject>
class ImageSize
{
public:
	~ImageSize();

	ImageSize(QString name,int size);
	QString Name();	
	int Size();

private:
	QString _name;
	int _size;
};

#endif // IMAGESIZE_H
