const config = {
  port: 3001,
  addr: "127.0.0.1",
  socket_addr: "/swtc/socket.io",
  dev_addr: "http://localhost:5173",
  dev_socket_addr: "http://127.0.0.1:3001/swtc",
  dc_timeout_seconds: 30,
  board_config: [
    [0,0,0], // top, sides, bottom - player count
    [1,0,0], // 1
    [2,0,0], // 2
    [2,0,1], // 3
    [2,0,2], // 4
    [2,0,3], // 5
    [2,1,2], // 6
    [2,1,3], // 7
    [3,1,3], // 8
    [3,1,4], // 9
    [4,1,4], // 10
    [4,1,5], // 11
    [4,2,4], // 12
    [4,2,5], // 13
    [5,2,5], // 14
    [4,3,5], // 15
    [5,3,5], // 16
  ],
  max_chat_message_length: 250,
}
export default config;