let busstop;

class BusStop {
  static async injectDB(conn) {
    busstop = await conn.db("sbs").collection("bus_stop");
  }

  // update number of people waiting (with AI camera)
  static async waiting(area, waiting) {
    await busstop.updateOne({ area: area }, { $set: { waiting: waiting } });
    let document = await busstop.find({ area: area }).toArray();
    if (document.length == 0) {
      return null;
    } else {
      let output = await busstop
        .find({ area: area })
        .project({ _id: 0 })
        .toArray();
      return output;
    }
  }

  // insert the bus stop document every 10 minutes
  static async insert(waiting) {
    await busstop.insertOne({
      area: "DT",
      waiting: waiting,
      time: new Date(),
    });
    let document = await busstop.find({ area: "DT" }).toArray();
    if (document.length == 0) {
      return null;
    } else {
      return document;
    }
  }

  //get bus stop location
  static async fetchLocation(area) {
    let search = await busstop.find({ area: area }).toArray();
    if (!search[0]) {
      return null;
    } else {
      return await busstop
        .find({ area: area })
        .project({
          area: 1,
          longitude: 1,
          latitude: 1,
          waiting: 1,
        })
        .toArray();
    }
  }
}

module.exports = BusStop;
