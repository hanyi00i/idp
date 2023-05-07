let bus;

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

class Bus {
  static async injectDB(conn) {
    bus = await conn.db("sbs").collection("bus");
  }

  // read bus location (with matched gps)
  static async fetchGPS(gps) {
    let search = await bus.find({ gps: gps }).toArray();
    if (!search[0]) {
      return null;
    } else {
      return await bus.update(
        { gps: gps },
        { $set: { latitude: gps.latitude, longitude: gps.longitude } }
      );
    }
  }

  // fetch bus location (with matched bus_plate)
  static async fetchLocation(bus_plate) {
    let search = await bus.find({ bus_plate: bus_plate }).toArray();
    if (!search[0]) {
      return null;
    } else {
      return await bus
        .find({ bus_plate: bus_plate })
        .project({
          bus_plate: 1,
          longitude: 1,
          latitude: 1,
        })
        .toArray();
    }
  }
}

module.exports = Bus;
