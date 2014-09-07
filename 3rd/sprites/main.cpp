/*
main.CPP
This is the entry point of the application.
*/
#include "spritemaker.h"
#include "symbols.h"
#include <QHash>
#include <stdio.h>
#include <Qdir>
//#include <QApplication>

int main(int argc, char *argv[])
{
#ifdef Q_WS_MAC
    QApplication *app = new QApplication(argc, argv);
    QDir dir(QApplication::applicationDirPath());
    dir.cdUp();
    dir.cd("Plugins");
    QApplication::setLibraryPaths(QStringList(dir.absolutePath()));
#endif
	if(argc < 3)
	{
		printf("\nSprite Generator Version 1.0a\n\nUsage: Sprite [Source Directory] [Destination Directory]\n");
		return -1;
	}
	
	SpriteMaker s;
	s.createSpriteImageandCSS(argv[1],argv[2]);
	printf("Sprites created Successfully!");	
}
