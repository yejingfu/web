package main

import (
    "fmt"
    "strings"
    "os"
    "syscall"
    "bufio"
)

func main() {
    fmt.Println("FIFO Client, please input message, Q to exit!")
    fifoPath := "/tmp/jeffye_fifo_testonly"
    fifo, err := os.OpenFile(fifoPath, os.O_WRONLY, 0600)
    if err != nil {
        fmt.Println("Failed to open the fifo", err)
        return
    }
    syscall.Dup2(int(fifo.Fd()), 1)
    syscall.Dup2(int(fifo.Fd()), 2)
    fifo.Close()
    
    var input string
    for {
        //fmt.Scanln(&input)  // not working here, it uses space to trim the input text
        reader := bufio.NewReader(os.Stdin)
        input, _ = reader.ReadString('\n')
        input = strings.TrimSpace(input)
        
        if input == "Q" || input == "q" {
            break
        }
//        fmt.Printf("[Client]: %s\n", input)
        fmt.Println(input)
        
    }
}
