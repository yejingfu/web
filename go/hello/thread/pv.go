package main

import (
    "fmt"
    "sync"
    "time"
)

const MAXTHREAD = 10
var cond = sync.NewCond(new(sync.Mutex))
var done = make(chan int)
var empty bool = true

func producer() {
    for i := 0; i < MAXTHREAD; i++ {
        for !empty {
            <-time.After(1e9)
        }
        empty = false
        fmt.Println("Producer: ", i)
        cond.Signal()    // V
    }
    <-time.After(2e9)
    done<-1
}

func consumer() {
    for {
        cond.L.Lock()
        if empty {
            cond.Wait()   // P
        }
        fmt.Println("Consumer")
        empty = true
        cond.L.Unlock()
        time.Sleep(1e9)
    }
}

func main() {
    fmt.Println("PV: passeren-vrijgeven")
    go producer()
    go consumer()
    <-done
    fmt.Println("End of main")
}
