const express = require("express");
const app = express();

const { proxy, scriptUrl } = require("rtsp-relay")(app);

const handler = proxy({
  url: `rtsp://advadmin:12345advAdmin*@127.0.0.1:11554/LiveH264_0`,
  verbose: false,
});

// the endpoint our RTSP uses
app.ws("/api/stream", handler);

// this is an example html page to view the stream
app.get("/", (req, res) =>
  res.send(`
  <style>
    #canvas {
      position: absolute;
      top: 0;
      left:0;
      width: 100%;
      height: 100%;
    }
  </style>
  <canvas id='canvas'></canvas>
  <script src='${scriptUrl}'></script>
  <script>
    loadPlayer({
      url: 'ws://' + location.host + '/api/stream',
      canvas: document.getElementById('canvas')
    });
  </script>
`)
);

app.listen(2000);
