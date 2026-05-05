const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// serve frontend files
app.use(express.static(__dirname));

/* DB connection */
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Charan@123#',
  database: 'smart_parking'
});

db.connect(err => {
  if (err) console.log("DB Error");
  else console.log("Connected to DB");
});

/* LOGIN */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, result) => {
      if (result.length > 0) res.send({ success: true });
      else res.send({ success: false });
    }
  );
});

/* CHECK SLOT */
app.get('/check-slot', (req, res) => {
  db.query(
    "SELECT * FROM parking_slots WHERE status='Available' LIMIT 1",
    (err, result) => {
      if (result.length > 0) {
        res.send({ available: true, slot: result[0] });
      } else {
        res.send({ available: false });
      }
    }
  );
});

/* BOOK */
app.post('/book', (req, res) => {
  const { plate, type, slot } = req.body;

  const vehicle_id = Math.floor(Math.random() * 10000);

  db.query(
    "INSERT INTO vehicles (vehicle_id, vehicle_number, vehicle_type) VALUES (?, ?, ?)",
    [vehicle_id, plate, type],
    (err) => {
      if (err) return res.send(err);

      db.query(
        "SELECT slot_id FROM parking_slots WHERE slot_number=?",
        [slot],
        (err2, result) => {

          const slot_id = result[0].slot_id;
          const booking_id = Math.floor(Math.random() * 10000);

          db.query(
            "INSERT INTO bookings (booking_id, vehicle_id, slot_id, booking_time, status) VALUES (?, ?, ?, NOW(), 'booked')",
            [booking_id, vehicle_id, slot_id],
            () => {

              db.query(
                "UPDATE parking_slots SET status='Occupied' WHERE slot_id=?",
                [slot_id],
                () => {
                  res.send("Booking Confirmed!");
                }
              );
            }
          );
        }
      );
    }
  );
});

/* START */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});