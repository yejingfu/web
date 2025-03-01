#include <cstdlib>

#include "./piest.h"

inline int randall(unsigned int *seed) {
#ifdef _WIN32
  return rand();
#else
  return rand_r(seed);
#endif
}

double estimate (int points) {
  int i = points;
  int inside = 0;
  unsigned int randseed = 1;
#ifdef _WIN32
  srand(randseed);
#endif

  unsigned int seed = randall(&randseed);
#ifdef _WIN32
  srand(seed);
#endif

  while(i-- > 0) {
    double x = randall(&seed) / static_cast<double>(RAND_MAX);
    double y = randall(&seed) / static_cast<double>(RAND_MAX);
    if ((x*x)+(y*y) <= 1)
      inside ++;
  }

  return (inside / static_cast<double>(points)) * 4;

}



