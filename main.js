const MongoClient = require("mongodb").MongoClient;
const BUS = require("./bus");
const BUS_STOP = require("./bus_stop");

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
    BUS.injectDB(client);
    BUS_STOP.injectDB(client);
  });

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Connected Bus System API",
      version: "1.0.0",
    },
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        scheme: "bearer",
        in: "header",
      },
    },
  },
  apis: ["./main.js"],
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); // Use this after the variable declaration

// welcome
app.get("/", function (req, res) {
  res.send("Hello World from IDP !\nSmart Bus System");
});

// Middleware Express for JWT
// app.use(verifyToken);

// bus.js
app.patch("/gps", async (req, res) => {
  console.log("Request Body : ", req.query);
  let bus = await BUS.fetchGPS(
    req.query.gps,
    req.query.latitude,
    req.query.longitude
  );
  if (bus != null) {
    console.log("Bus GPS location Updated");
    res.status(200).json(bus);
  } else {
    console.log("Bus GPS not found");
    res.status(404).send("Bus GPS not found");
  }
});

app.get("/bus", async (req, res) => {
  console.log("Request Body : ", req.query);
  let bus = await BUS.fetchLocation(req.query.bus_plate);
  if (bus != null) {
    console.log("Bus location found and displayed");
    res.status(200).json(bus);
  } else {
    console.log("Bus location not found");
    res.status(404).send("Bus location not found");
  }
});

//bus_stop.js
app.patch("/waiting", urlencodedParser, async (req, res) => {
  console.log("Request Body : " + req.query);
  let bs = await BUS_STOP.waiting(req.query.area, req.query.waiting);
  if (bs != null) {
    console.log("People waiting at bus stop is " + req.query.waiting);
    res.status(200).json(bs);
  } else {
    console.log("Bus stop ID not found");
    res.status(404).send("Bus stop ID not found");
  }
});

app.post("/insert", async (req, res) => {
  console.log("Request Body : ", req.query);
  let bs = await BUS_STOP.insert(req.query.waiting);
  if (bs != null) {
    console.log("Bus stop document inserted");
    res.status(200).json(bs);
  } else {
    console.log("Bus stop not found");
    res.status(404).send("Bus stop not found");
  }
});

app.get("/bustop", async (req, res) => {
  console.log("Request Body : ", req.query);
  let bs = await BUS_STOP.fetchLocation(req.query.area);
  if (bs != null) {
    console.log("Bus stop location found and displayed");
    res.status(200).json(bs);
  } else {
    console.log("Bus stop location not found");
    res.status(404).send("Bus stop location not found");
  }
});

app.listen(port, () => {
  console.log(`Smart Bus Stop app is listening on port ${port}`);
});

//***********************************************************************************************/

// JSON Web Token
const jwt = require("jsonwebtoken");
function generateAccessToken(payload) {
  return jwt.sign(payload, "idp", { expiresIn: "1h" }); // expires in 1 hour
}

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "idp", (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
