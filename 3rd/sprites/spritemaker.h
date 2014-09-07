#ifndef SPRITEMAKER_H
#define SPRITEMAKER_H

#include <QObject>
#include <QHash>
#include "imageinfo.h"
#include "packedimages.h"

class SpriteMaker : public QObject
{
	Q_OBJECT

public:
	SpriteMaker();
	~SpriteMaker();
	void createSpriteImageandCSS(QString SourceDirectory,QString DestinationDirectory);
private:
	void saveSpriteImage(PackedImages images,int serialnumber);
	void addCSSEntry(QString outputImageName,ImageInfo imageinfo,int x,int y);
	void addJSONEntry(QString outputImageName,ImageInfo imageinfo,int x,int y);

	void generateCSS();
	void generateJSON();
	
	QString _sourceDirectory;
	QString _destinationDirectory;
    QString _outputName;
        QHash<QString,QHash<QString,QStringList> > _JSONCollection;
	QStringList _CSSCollection;
};


#endif // SPRITEMAKER_H
