package main

import (
    "fmt"
    "runtime"
)

func main() {
    runtime.GOMAXPROCS(4)
    var MAXTHREADS = 20
    var exitCodes = make(chan string, MAXTHREADS)
    for i:= 0; i< MAXTHREADS; i++ {
        go func(idx int) {
            fmt.Println("[sub]: ", idx)
            exitCodes <- fmt.Sprintf("I am sub %d", idx)
        }(i)
    }

    fmt.Println("[main]: waiting on exit from subs")
    for j:= 0; j < MAXTHREADS; j++ {
        str := <- exitCodes
        fmt.Println("[main]: exit sub: ", str)
    }

    fmt.Println("[main]: exit main")
}
