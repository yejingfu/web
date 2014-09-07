/*
packer.CPP
Implementation of the packer class
*/

#include "packer.h"
#include "imageinfo.h"
#include <QPair>
#include <QtAlgorithms>
Packer::Packer(QStringList FileList,QString SourcePath)
{
	_fileList = FileList;
	_sourcePath = SourcePath;
}

Packer::~Packer()
{

}
bool SortAlgorithm(const QPair<int,ImageInfo> &s1, const QPair<int,ImageInfo> &s2)
{
    return s1.first > s2.first;
}

//Method - performSimplePack
//Description - Public method that iterates through all the images in _fileList and packs them in a 512x512 container. If the images 
//				do not fit in the 512x512, another container is created.
//Arguments: 
//Returns - QList<PackedImages> - A list of PackedImages objects that contain information about the image locations in each sheet
QList<PackedImages> Packer::performSimplePack(){
	QList<ImageInfo> ImageList;
    QList<QPair<int,ImageInfo> > ImageListWidth;
    QList<QPair<int,ImageInfo> > ImageListHeight;
	for(int i=0;i<_fileList.length();i++)
	{
		QRegExp regex1("^(.*-\\d+x\\d+)-(.*)\\.(.*)");
		QRegExp regex2("^(.*)-(.*)\\.(.*)");
		QString name;
		QString state;

		int ind = regex1.indexIn(_fileList[i]);
		if(ind > -1)
		{
			name = regex1.cap(1);
			state = regex1.cap(2);
		}else 
		{
			ind = regex2.indexIn(_fileList[i]);
			if(ind > -1)
			{
				name = regex2.cap(1);
				state = regex2.cap(2);
			}
		}
		QImage currentImage(_sourcePath +"/"+_fileList[i]);
		ImageInfo image(currentImage,-1,-1,name,state);

		ImageListWidth.append(QPair<int,ImageInfo>(currentImage.width(),image));
		ImageListHeight.append(QPair<int,ImageInfo>(currentImage.height(),image));
	}
    qStableSort(ImageListWidth.begin(),ImageListWidth.end(),SortAlgorithm);
    qStableSort(ImageListHeight.begin(),ImageListHeight.end(),SortAlgorithm);

	QList<PackedImages> packedCollection;

	int MaxCanvasHeight = 512;
	int MaxCanvasWidth = 512;

	int tallestImage=0;
	int widestRow = 0;
    int padding = 1;

	int canvasHeight=0;
	int canvasWidth = 0;
	for (int i=0;i<ImageListHeight.count();i++)
	{

		ImageInfo currentImage = ImageListHeight[i].second;
        //If the image is either longer or wider than 512, this creates a single image with the size the same as this image
        //There is no need to add padding in this case
        if(currentImage.Image().height() > MaxCanvasHeight || currentImage.Image().width() > MaxCanvasWidth)
		{
			QList<ImageInfo> singleImage;

			currentImage.setPosition(0,0);
			singleImage.append(currentImage);
			PackedImages images(singleImage,currentImage.Image().width() ,currentImage.Image().height() );	
			packedCollection.append(images);
			continue;
		}
        //If adding another image in the same row will go out of bounds of the 512x512 sheet
        //Consider padding here as it will be added to the image (Note: we don't really need to pad the last image)
        else if(canvasWidth + currentImage.Image().width() + padding > MaxCanvasWidth){
            //CASE a: If the current canvas height + the tallest image of the previous row + the height of this image will go out of
            //bounds of the 512x512 sheet then create a packed image and reset all values for the next sheet
            if(canvasHeight + tallestImage  + currentImage.Image().height() + padding > MaxCanvasHeight){
                canvasHeight = canvasHeight + tallestImage + padding;
				PackedImages images(ImageList,canvasWidth,canvasHeight);		
				packedCollection.append(images);
				ImageList.clear();
				canvasHeight = 0;
				canvasWidth = 0;
				tallestImage = 0;
                                widestRow = 0;
				continue;
			}
                        //CASE B: If the current canvas height + the tallest image of the previous row + the height of this image are within bounds of the
                        // 512x512 sheet, increase the canvas height and reset the canvaswidth and tallest image.
			else
			{
                canvasHeight = canvasHeight + tallestImage + padding;
				canvasWidth = 0;
				tallestImage=0;
			}
		}		
	
		currentImage.setPosition(canvasWidth,canvasHeight);
        if(currentImage.Image().height()>tallestImage){
			tallestImage = currentImage.Image().height();
		}
        canvasWidth = canvasWidth + currentImage.Image().width() + padding;
                if(canvasWidth > widestRow){
                        widestRow = canvasWidth;
                }
		
		ImageList.append(currentImage);

	}

	PackedImages images(ImageList,widestRow,canvasHeight + tallestImage);
	packedCollection.append(images);
	return packedCollection;
}


