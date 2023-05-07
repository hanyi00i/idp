let busstop;

class BusStop {
  static async injectDB(conn) {
    busstop = await conn.db("sbs").collection("bus_stop");
  }

  // update number of people waiting (with AI camera perhaps with matched bs_id?)
  static async waiting(area, waiting) {
    await busstop.updateOne({ bs_id: bs_id }, { $set: { waiting: waiting } });
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
  now = new Date();
  static async insert(waiting) {
    await busstop.insertOne({
      area: "Durian Tunggal",
      waiting: waiting,
      latitude: "100",
      longitude: "50",
      time: now,
    });
    let document = await busstop.find({ time: now }).toArray();
    if (document.length == 0) {
      return null;
    }
  }
}

module.exports = BusStop;
