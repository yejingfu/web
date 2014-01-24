package main

import (
    "fmt"
    "sync"
    "runtime"
)

func main() {
    fmt.Println("Testing sync.Cond and sync.WaitGroup")
    runtime.GOMAXPROCS(runtime.NumCPU())

    var wg sync.WaitGroup

    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(idx int) {
            fmt.Printf("[sub %d]: Done\n", idx)
            wg.Done()
        }(i)
    }
    
    wg.Wait()
    fmt.Println("[main]: read to exit")
}
