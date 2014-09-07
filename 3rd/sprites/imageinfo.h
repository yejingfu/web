#ifndef IMAGEINFO_H
#define IMAGEINFO_H

#include <QPainter>
#include <QObject>
class ImageInfo
{
public:
ImageInfo();
	ImageInfo(QImage image, int positionX, int positionY, QString Name, QString State);
	~ImageInfo();

	QImage Image();	
	int PositionX();
	int PositionY();
	QString Name();
	QString NameWithSize();
	QString State();
	void setPosition(int x, int y);

private:
	QImage _image;
	int _x;
	int _y;
	QString _name;
	QString _namewithsize;
	QString _state;
};

#endif // IMAGEINFO_H
