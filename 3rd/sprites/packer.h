#ifndef PACKER_H
#define PACKER_H

#include "packedimages.h"
#include <QObject>
class Packer
{
public:
	Packer(QStringList FileList,QString SourcePath);
	~Packer();

	QList<PackedImages> performSimplePack();
private:
	QStringList _fileList;
	QString _sourcePath;
	
};

#endif // PACKER_H
