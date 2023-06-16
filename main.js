const MongoClient = require("mongodb").MongoClient;
const BUS_STOP = require("./bus_stop");

const mqtt = require("mqtt");
const broker = "mqtt://broker.emqx.io";
const topic = "camera-idp";

const mqttclient = mqtt.connect(broker, { clientId: "camera-mqtt-2" });

mqttclient.on("connect", () => {
  mqttclient.subscribe(topic);
  console.log("Connected to MQTT Broker", broker);
});

const axios = require("axios");
const cron = require("node-cron");
var message = "0";
cron.schedule("*/1 * * * * *", function () {
  axios
    .get("http://127.0.0.1:18088/api/v1/count")
    .then((response) => {
      message = response.data.data[0].frame_count[1];
    })

    .catch((error) => {
      console.error("Error:", error);
    });
  mqttclient.publish(
    topic,
    message.toString(),
    { qos: 0, retain: false },
    (error) => {
      if (error) {
        console.error(error);
      }
    }
  );
  MongoInsert(message);
});

MongoClient.connect("mongodb+srv://admin:admin@idp.3vyarrm.mongodb.net/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    console.log("Connected to MongoDB");
    BUS_STOP.injectDB(client);
  });

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", function (req, res) {
  res.send("Hello World from IDP !\nSmart Bus System");
});

async function MongoInsert(data) {
  BUS_STOP.insert(data);
}

app.listen(port, () => {
  console.log(`Smart Bus Stop app is listening on port ${port}`);
});
