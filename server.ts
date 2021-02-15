const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
import { log } from "console";
import WebSocket from "ws";
import { Message } from "./src/interface/message";

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
// Workers can share any TCP connection
// In this case it is an HTTP server

log("cool");

const wss = new WebSocket.Server({
  port: +process.env.PORT,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed.
  },
});

const sendMessage = (ws, channel, data) => {
  const message: Message = { channel, data };
  ws.send(JSON.stringify(message));
};

let numberOfClients = 0;
wss.on("connection", function connection(ws) {
  log("clients", ++numberOfClients);

  ws.on("message", function incoming(message) {
    const parsedMessage: Message = JSON.parse(message.toString());
    // log("received: %s", parsedMessage.data);
  });

  ws.on("close", function close() {
    log("disconnected", --numberOfClients);
  });

  sendMessage(ws, "check", "all good");
});

console.log(`Worker ${process.pid} started`);
// }
