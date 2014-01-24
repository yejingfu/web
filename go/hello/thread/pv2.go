package main

import (
    "fmt"
    "runtime"
)

// It's totally different with var countch = make(chan int)
// If the size is omitted, the channel is unbufferred
var countch = make(chan int, 1)
var done = make(chan bool)

func producer() {
    for i:= 0; i < 10; i++ {
        countch <- i
        fmt.Println("Producer: ", i)
    }
    done <- true
}

func consumer() {
    for {
        i := <- countch
        fmt.Println("Consumer", i)
    }
}

func main() {
    runtime.GOMAXPROCS(runtime.NumCPU())
    go producer()
    go consumer()
    <- done
    fmt.Println("Exit main")
}
