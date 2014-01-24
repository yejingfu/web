package main

import (
    "fmt"
    "errors"
    "os"
    "os/signal"
    "syscall"
    "bufio"
    "io"
)

func createFifo(filePath string) error {
    os.Remove(filePath)
    // create RDWR named pipe file
    //err := syscall.Exec("/bin/sh", []string{"sh", "-c", "mkfifo -m 0600 " + filePath}, []string{fmt.Sprintf("PATH=%s", os.Getenv("PATH"))})
    attr := os.ProcAttr {
        Env: []string{fmt.Sprintf("PATH=%s", os.Getenv("PATH"))},
    }
    pid, err := os.StartProcess("/bin/sh", []string{"sh", "-c", "mkfifo -m 0600 " + filePath}, &attr)
    fmt.Println("Created fifo in process: ", pid.Pid)

    if err != nil {
        return err
    }

    ws, _ := pid.Wait()
    if !ws.Success() {
        return errors.New(fmt.Sprintf("Failed: %s", ws.String()))
    }
//    return nil
    
    // clean close-on-exec flag
    fifo, err2 := openFifo(filePath)
    if err2 != nil {
        return err2
    }
    defer fifo.Close()
    _, _, errno:= syscall.Syscall(syscall.SYS_FCNTL, uintptr(fifo.Fd()), syscall.F_SETFD, 0)
    if errno != 0 {
        return errors.New(fmt.Sprintf("Cannot clean the close-on-exec flag on the fifo."))
    }
    return nil
}

func openFifo(filePath string) (fifo *os.File, err error) {
    // Open the file for reading, the mode is O_RDONLY
    fifo, err = os.OpenFile(filePath, os.O_RDWR, 0600)
    return
}

func main() {
    fmt.Println("Run FIFO server....")
    fifoPath := "/tmp/jeffye_fifo_testonly"
    var fifo *os.File
    var err error
    err = createFifo(fifoPath)

    if err != nil {
        fmt.Println("Failed to create fifo: ", err)
        return
    }
    fifo, err = openFifo(fifoPath)
    if err != nil {
        fmt.Println("Failed to open fifo: ", err)
        return
    }
    defer fifo.Close()

    go func() {
        // By default, the maximum size of named pipe is 4096
        buf := bufio.NewReaderSize(fifo, 4096)
        for {
            line, err := buf.ReadString('\n')  // read text ending by RETURN, the text contains the RETURN
            if err == io.EOF {
                fmt.Println("EOF")
                break
            }
            if len(line) == 0 {
                continue
            }
            line = line[0:len(line) -1]
            fmt.Printf("[Server]: %s\n", line)
        }
    }()


    sigch := make(chan os.Signal)
    signal.Notify(sigch)
End:
    for {
        sig := <-sigch
        switch sig {
        case syscall.SIGINT:
            break End
        }
    }

    curProc, _ := os.FindProcess(os.Getpid())
    curProc.Signal(syscall.SIGKILL)  // or: curProc.Kill()

    
    fmt.Println("Exit the server!")
}
