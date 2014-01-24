package libs

type LogRequest struct {
    LogLines []byte
}

type LogReply struct {
    Lease int64
}
