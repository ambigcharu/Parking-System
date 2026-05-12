
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());


app.use(express.static(__dirname));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Charan@123#',
  database: 'smart_parking'
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database Connection Failed");
  } else {
    console.log("✅ Connected To MySQL");
  }
});


app.post('/login', (req, res) => {

  const { email, password } = req.body;

  const sql =
    "SELECT * FROM users WHERE email=? AND password=?";

  db.query(sql, [email, password], (err, result) => {

    if (err) {
      return res.send(err);
    }

    if (result.length > 0) {

      res.send({
        success: true,
        user: result[0]
      });

    } else {

      res.send({
        success: false
      });

    }
  });
});

app.post('/validate-vehicle', (req, res) => {

  const { plate, type } = req.body;

  const sql =
    "SELECT * FROM vehicles WHERE vehicle_number=? AND LOWER(vehicle_type)=LOWER(?)";

  db.query(sql, [plate, type], (err, result) => {

    if (err) {

      return res.send({
        success: false
      });
    }

    if (result.length > 0) {

      res.send({
        success: true
      });

    } else {

      res.send({
        success: false
      });
    }
  });
});


app.get('/check-slot', (req, res) => {

  const sql =
    "SELECT * FROM parking_slots WHERE status='Available' LIMIT 1";

  db.query(sql, (err, result) => {

    if (err) {
      return res.send(err);
    }

    if (result.length > 0) {

      res.send({
        available: true,
        slot: result[0]
      });

    } else {

      res.send({
        available: false
      });

    }
  });
});



app.post('/book', (req, res) => {

  const { plate, type, slot } = req.body;

  // check if vehicle already exists
  const checkVehicleSql =
    "SELECT * FROM vehicles WHERE vehicle_number=?";

  db.query(checkVehicleSql, [plate], (err, vehicleResult) => {

    if (err) {
      return res.send(err);
    }

    // VEHICLE EXISTS
    if (vehicleResult.length > 0) {

      const vehicle_id = vehicleResult[0].vehicle_id;

      continueBooking(vehicle_id);

    }

    // NEW VEHICLE
    else {

      const vehicle_id =
        Math.floor(Math.random() * 10000);

      const insertVehicleSql =
        "INSERT INTO vehicles (vehicle_id, vehicle_number, vehicle_type) VALUES (?, ?, ?)";

      db.query(
        insertVehicleSql,
        [vehicle_id, plate, type],
        (err2) => {

          if (err2) {
            return res.send(err2);
          }

          continueBooking(vehicle_id);
        }
      );
    }
  });


  function continueBooking(vehicle_id) {

    const getSlotSql =
      "SELECT slot_id FROM parking_slots WHERE slot_number=?";

    db.query(getSlotSql, [slot], (err3, result) => {

      if (err3) {
        return res.send(err3);
      }

      const slot_id = result[0].slot_id;

      const booking_id =
        Math.floor(Math.random() * 10000);

      const bookingSql =
        "INSERT INTO bookings (booking_id, vehicle_id, slot_id, booking_time, start_time, end_time, status) VALUES (?, ?, ?, NOW(), NOW(), NOW(), 'Booked')";

      db.query(
        bookingSql,
        [booking_id, vehicle_id, slot_id],
        (err4) => {

          if (err4) {
            return res.send(err4);
          }

          // trigger automatically updates slot status

          res.send({
            success: true,
            message: "✅ Booking Confirmed"
          });
        }
      );
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server Running At http://localhost:3000/parking.html");
});