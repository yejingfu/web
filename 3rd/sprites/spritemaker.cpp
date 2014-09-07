/*
SpriteMaker.CPP
This contains the implementation of the methods that allow for filtering all the files of a specified folder
and gettings lists of images that need to be converted into Sprite sheets. Along with the creation of the Sprite
sheets, a consolidated CSS file is also created that points to the specific image on a specific file
*/

#include <QPainter>
#include <QString>
#include <QDir>
#include <QtCore/qmath.h>
#include "spritemaker.h"
#include "packer.h"
#include "packedimages.h"
#include "imageinfo.h"
#include <qtextstream.h>
#include "symbols.h"

SpriteMaker::SpriteMaker(){
}
SpriteMaker::~SpriteMaker(){
}

//Method - addJSONEntry
//Description - Private method that inserts an entry into the JSON collection based on the input parameters.
//              
//Arguments: outputImageName (QString) - The name of the sprite image which will be created (eg 16x16.png, 32x32.png)
//           imageSize (ImageSize) - An object of type ImageSize that contains the size related information about the image
//           x (int) - The horizontal position of the image on the sprite (pixels)
//           y (int) - The vertical position of the image on the sprite (pixels)
//Returns - void 
void SpriteMaker::addJSONEntry(QString outputImageName,ImageInfo imageinfo, int x, int y)
{
	QString outputSize ;
	QString imageName, imageState;
	QString xval,yval;
	xval = QString::number(-x);
	yval = QString::number(-y);

	imageName = imageinfo.Name();// + "-" + imageinfo.State();
	imageState = imageinfo.State();

	outputSize = QString::number(imageinfo.Image().width());

	if(_JSONCollection.contains(imageName)){
		if(_JSONCollection[imageName].contains(imageState)){
                        _JSONCollection[imageName][imageState].append(QString("\"url\":\"%1\",\"w\": %2,\"h\": %3,\"x\": %4,\"y\": %5").arg(outputImageName,QString::number(imageinfo.Image().width()),QString::number(imageinfo.Image().height()),QString::number(imageinfo.PositionX()),QString::number(imageinfo.PositionY()) ));
		}
		else
		{
			QStringList strlist;
                        strlist.append(QString("\"url\":\"%1\",\"w\": %2,\"h\": %3,\"x\": %4,\"y\": %5").arg(outputImageName,QString::number(imageinfo.Image().width()),QString::number(imageinfo.Image().height()),QString::number(imageinfo.PositionX()),QString::number(imageinfo.PositionY())));
			_JSONCollection[imageName].insert(imageState,strlist);
		}
	}
	else{
		QStringList strlist1;
		QHash<QString,QStringList>  strlist2;
                QString jsonPrefix = "{";
                strlist1.append(QString("\"url\":\"%1\",\"w\": %2,\"h\": %3,\"x\": %4,\"y\": %5").arg(outputImageName,QString::number(imageinfo.Image().width()),QString::number(imageinfo.Image().height()),QString::number(imageinfo.PositionX()),QString::number(imageinfo.PositionY())));
		strlist2.insert(imageState,strlist1);
		_JSONCollection.insert(imageName,strlist2);
	}
	//return QString(".img-%1-%2 { background-image: url('%3'); width: %4px; height: %5px; background-position: %5px %6px; display: inline-block; }\n").arg(imageName,imageState,outputImageName,outputSize,xval,yval);
	//return QString("\"%1\": { \"%2\": { \"url\": \"%3\", \"w\": %4,\"h\": %5,\"x\": %6,\"y\": %7 } } ").arg(imageName,imageState,outputImageName, imageinfo.Image().width(),imageinfo.Image().height(),imageinfo.PositionX(),imageinfo.PositionY() );
}

//Method - addCSSEntry
//Description - Private method that inserts formatted CSS entry for a specific image within the sprite.
//              The background position is set so that it returns the exact position of the image on the sprite sheet
//Arguments: outputImageName (QString) - The name of the sprite image which will be created (eg 16x16.png, 32x32.png)
//           imageSize (ImageSize) - An object of type ImageSize that contains the size related information about the image
//           x (int) - The horizontal position of the image on the sprite (pixels)
//           y (int) - The vertical position of the image on the sprite (pixels)
//Returns - void 
void SpriteMaker::addCSSEntry(QString outputImageName,ImageInfo imageinfo, int x, int y)
{

        QString outputWidth,outputHeight ;
	QString imageName, imageState;
	QString xval,yval;
	xval = QString::number(-x);
	yval = QString::number(-y);

	imageName = imageinfo.NameWithSize();
	imageState = imageinfo.State();

        outputWidth = QString::number(imageinfo.Image().width());
        outputHeight = QString::number(imageinfo.Image().height());

        _CSSCollection.append(QString(".img-%1-%2 { background-image: url('%3'); width: %4px; height: %5px; background-position: %6px %7px; display: inline-block; }").arg(imageName,imageState,outputImageName,outputWidth,outputHeight,xval,yval));

}
//Method - saveSpriteImage
//Description - Private method that iterates through all the images based on the file names passed as an argument and
//              creates a sprite image. 
//Arguments: fileList (QStringList) - A list of all the complete files names for a specific filter (eg 16x16 or 32x32)
//           imageSize (ImageSize) - An object of type ImageSize that contains the size related information about the image
//Returns - void
void SpriteMaker::saveSpriteImage(PackedImages images,int serialnumber)
{
	/*if(images.length() == 0)
	return "";*/
	QString outputFileName;

    outputFileName = _outputName + QString::number(serialnumber) + "." +Symbols::DEFAULT_EXTENSION;

	QImage finalImage(images.ContainerWidth() ,images.ContainerHeight(),QImage::Format_ARGB32_Premultiplied);
	finalImage.fill(0x00000000);
	QPainter painter(&finalImage);


    for(int i=0;i<images.ImageCollection().count();i++)
	{
        ImageInfo imageinfo = images.ImageCollection()[i];

		int x= imageinfo.PositionX() ;
		int y = imageinfo.PositionY();

		painter.setCompositionMode(QPainter::CompositionMode_SourceOver);
		painter.drawImage(QRectF(x, y, imageinfo.Image().width(), imageinfo.Image().height()), imageinfo.Image(),
			QRectF(0, 0, imageinfo.Image().width(), imageinfo.Image().height()));

		addCSSEntry(outputFileName,imageinfo,x,y);
		addJSONEntry(outputFileName,imageinfo,x,y);
	}
	painter.end();
	finalImage.save(_destinationDirectory+"/"+outputFileName);
	this->generateCSS();
	this->generateJSON();
}

//Method - createSpriteImageandCSS
//Description - Public method that iterates through all the image sizes that need to be processes and forms lists based on each filter
//              It then makes calls to save sprite images for each list and generates a consolidated CSS file based on each sprite image
//Arguments: SourceDirectory (QString) - Path of the source directory that contains the images that need to be included in the sprite sheet
//           DestinationDirectory (QString) - Path of the destination directory in which the sprite sheet files as well as the CSS file need to be emitted
//           imageSizes (QHash<QString,ImageSize>) - A dictionary of all the image sizes that need to be filtered and processed
void SpriteMaker::createSpriteImageandCSS(QString SourceDirectory, QString DestinationDirectory)
{
	_sourceDirectory = SourceDirectory;
	_destinationDirectory = DestinationDirectory;
    QDir sourceDir(_sourceDirectory);
    _outputName = sourceDir.dirName();

	QDir myDir(SourceDirectory);
	QStringList fileList = myDir.entryList(QDir::Files); 
	QString cssString = "";
	QRegExp regex("^.*-.*");

	QStringList fileListFiltered = fileList.filter(regex);
	fileListFiltered.sort();

	Packer packer(fileListFiltered,_sourceDirectory);
	QList<PackedImages> imageCollection = packer.performSimplePack();

	int index =0;
	foreach(PackedImages images,imageCollection){
		this->saveSpriteImage(images,++index);
	}


	return;
}

//Method - generateCSS
//Description - Private method that creates the images.css file in the defined destination directory
//Arguments: 
//Returns - void 
void SpriteMaker::generateCSS(){
        QFile filename(_destinationDirectory+"/" + _outputName + ".css");

	if(filename.open(QFile::WriteOnly ) )
	{
		QTextStream writestring (&filename);
		writestring << _CSSCollection.join("\n");
		filename.close();
	}

}

//Method - generateJSON
//Description - Private method that creates the images.json file in the defined destination directory
//Arguments: 
//Returns - void 
void SpriteMaker::generateJSON(){
	QString key1;
        QStringList formattedJSONList;

	foreach(key1,_JSONCollection.keys()){
		QString item;
		QString name = key1;
		QString key2;
		QStringList innerJSONList1;
		foreach(key2,_JSONCollection[key1].keys()){
			QString state = key2;
			QStringList innerJSONList2;
			QStringList jsonList = _JSONCollection[key1][key2];
			foreach(item,jsonList){
				innerJSONList2.append(QString("{%1}").arg(item));
			}
                        innerJSONList1.append(QString("\"%1\": [ %2 ]").arg(state, innerJSONList2.join(",")));
		}
                // added a "," after the last paratheses.   additional code added below to remove last ','
                formattedJSONList.append( QString("\"%1\": { %2 },").arg(name,innerJSONList1.join(",")));
	}

        // removing last appended comma from the last json section.
        if(!formattedJSONList.isEmpty()){
            QString lastLine = formattedJSONList.takeLast();
            lastLine.chop(1);
            formattedJSONList.append(lastLine);
        }

        QFile filename(_destinationDirectory+"/" + _outputName + ".json");

	if(filename.open(QFile::WriteOnly ) )
	{
		QTextStream writestring (&filename);
                // adding "{}" to prefix and suffix JSON.
                writestring << "{\n";
		writestring << formattedJSONList.join("\n");
                writestring << "}";
		filename.close();
	}
}
