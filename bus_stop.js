let busstop;

class BusStop {
  static async injectDB(conn) {
    busstop = await conn.db("sbs").collection("people");
  }

  static async insert(waiting) {
    console.log("inserting document", waiting);
    await busstop.insertOne({
      waiting: waiting,
      time: new Date(),
    });
  }
}

module.exports = BusStop;
