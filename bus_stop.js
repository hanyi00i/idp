let busstop;
var lastInsertTime = 0; // Variable to store the time of the last insertion

class BusStop {
  static async injectDB(conn) {
    busstop = await conn.db("sbs").collection("people");
  }

  // insert the bus stop document every 1 second
  static async insert(waiting) {
    const currentTime = new Date().getTime();
    if (currentTime - lastInsertTime > 1000) {
      console.log("Inserting bus stop document");
      await busstop.insertOne({
        waiting: waiting,
        time: new Date(),
      });
      lastInsertTime = currentTime; // Update the last insert time
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
