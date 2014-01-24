package main

import (
    "fmt"
    "os"
    "net"
    "net/rpc"
    "socket/libs"
)




func main() {
    fmt.Println("Client of Socket")
    for idx, arg := range os.Args {
        fmt.Printf("Args[%d]: %s\n", idx, arg)
    }
    var text string = ""
    for i := 1; i < len(os.Args); i++ {
        text += os.Args[i]
//        text += "\n"
    }

    fmt.Println("Send message from client: ", text, "...")

    conn, err := net.Dial("unix", "/tmp/jeffye_socket_testonly")
    if err != nil {
        panic(fmt.Sprintf("Cannot connect to socket server: %s\n", err))
    }
    client := rpc.NewClient(conn)

    req := &libs.LogRequest{LogLines: []byte(text)}
    reply := &libs.LogReply{}

    for i := 0; i < 10; i++ {
        req.LogLines = []byte(fmt.Sprintf("[msg %d]: %s", i, text))
        err = client.Call("ServerNode.Log", req, reply)
        if err != nil {
            fmt.Println("Failed to send message to server: ", err)
        }
    }

    client.Close()
    conn.Close()
}
