package main

import (
    "fmt"
    "os"
    "os/signal"
    "syscall"
    "net"
    "net/rpc"
    "time"

    "socket/libs"
)

type ServerNode struct {}

func (*ServerNode) Log(req *libs.LogRequest, reply *libs.LogReply) error {
//    time.Sleep(2e9)
    <-time.After(2e9)
    fmt.Println("ServerNode.Log:", string(req.LogLines))
    return nil
}

func main() {
    fmt.Println("Start running socket server: /tmp/jeffye_socket_testonly...")
    os.Remove("/tmp/jeffye_socket_testonly")
    listener, err := net.Listen("unix", "/tmp/jeffye_socket_testonly")
    if err != nil {
        panic(fmt.Sprintf("Failed to open the socket: %s\n", err))
    }
    
    rpc.Register(&ServerNode{})
    
    go func() {
        for {
            conn, err := listener.Accept()
            if err != nil {
                panic(fmt.Sprintf("Error on Accept: %s\n", err))
            }
            go rpc.ServeConn(conn)
        }
    }()

    sigch := make(chan os.Signal)
    signal.Notify(sigch)
    for {
        sig := <-sigch
        switch sig {
        case syscall.SIGTERM:
            fmt.Println("syscall.SIGTERM")
            return
        case syscall.SIGINT:
            fmt.Println("syscall.SIGINT")
            return
        }
    }
}
