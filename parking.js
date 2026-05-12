
var slotNumber = "";
var isSignup = false;

/* SCREEN SWITCH */
function show(id) {

  var screens =
    document.getElementsByClassName("screen");

  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove("active");
  }

  document.getElementById(id)
    .classList.add("active");

  window.scrollTo(0, 0);
}

/* LOGIN / SIGNUP UI */
function toggleSignup(e) {

  e.preventDefault();

  isSignup = !isSignup;

  document.getElementById("login-title").innerText =
    (isSignup ? "Sign Up" : "Login")
    + " - Smart Parking";

  document.getElementById("name-field").style.display =
    isSignup ? "block" : "none";

  document.getElementById("login-btn").innerText =
    isSignup ? "Create Account" : "Login";

  document.getElementById("switch-text").innerText =
    isSignup ?
    "Already have an account?"
    :
    "New user?";

  document.getElementById("switch-link").innerText =
    isSignup ? "Login" : "Sign up";
}

/* LOGIN */
function goToVehicle() {

  var email =
    document.getElementById("email").value;

  var pwd =
    document.getElementById("password").value;

  if (!email || !pwd) {

    alert("Please enter email and password");
    return;
  }

  fetch('http://localhost:3000/login', {

    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      email: email,
      password: pwd
    })

  })

  .then(res => res.json())

  .then(data => {

    if (data.success) {

      show("screen-vehicle");

    } else {

      alert("Invalid Login Details");

    }
  });
}

/* SLOT CHECK + VEHICLE VALIDATION */
function checkSlot() {

  var owner =
    document.getElementById("owner")
    .value.trim();

  var plate =
    document.getElementById("plate")
    .value.trim();

  var model =
    document.getElementById("model")
    .value.trim();

  var vtype =
    document.getElementById("vtype").value;

  var btime =
    document.getElementById("btime").value;

  /* OWNER VALIDATION */
  if (owner === "") {

    alert("Please enter owner name");
    return;
  }

  /* MODEL VALIDATION */
  if (model === "") {

    alert("Please enter vehicle model");
    return;
  }

  /* NUMBER PLATE VALIDATION */

  var platePattern =
    /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

  if (!platePattern.test(plate.toUpperCase())) {

    alert(
      "Enter valid number plate example: KA01AB1234"
    );

    return;
  }

  /* VEHICLE VALIDATION FROM DATABASE */

  fetch('http://localhost:3000/validate-vehicle', {

    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      plate: plate,
      type: vtype
    })

  })

  .then(res => res.json())

  .then(vehicleData => {

    /* WRONG VEHICLE TYPE */

    if (!vehicleData.success) {

      alert(
        "Vehicle type does not match database records"
      );

      return;
    }

    /* CHECK SLOT */

    fetch('http://localhost:3000/check-slot')

    .then(res => res.json())

    .then(data => {

      if (data.available) {

        slotNumber = data.slot.slot_number;

        document.getElementById("slot-yes")
          .style.display = "block";

        document.getElementById("slot-no")
          .style.display = "none";

        document.getElementById("slot-num")
          .innerText = slotNumber;

        document.getElementById("slot-veh")
          .innerText =
          plate + " (" + vtype + ")";

        document.getElementById("slot-time")
          .innerText =
          btime || "Not set";

      }

      else {

        document.getElementById("slot-yes")
          .style.display = "none";

        document.getElementById("slot-no")
          .style.display = "block";
      }

      show("screen-slot");
    });

  });
}

/* PAYMENT SCREEN */
function goToPayment() {

  var plate =
    document.getElementById("plate").value;

  var vtype =
    document.getElementById("vtype").value;

  var dur =
    parseInt(
      document.getElementById("duration").value,
      10
    ) || 1;

  var rate =
    vtype === "car" ? 50 : 20;

  var total = dur * rate;

  document.getElementById("pay-slot")
    .innerText = slotNumber;

  document.getElementById("pay-plate")
    .innerText = plate;

  document.getElementById("pay-type")
    .innerText = vtype;

  document.getElementById("pay-dur")
    .innerText = dur;

  document.getElementById("pay-total")
    .innerText = total;

  document.getElementById("done-slot")
    .innerText = slotNumber;

  document.getElementById("done-plate")
    .innerText = plate;

  show("screen-payment");
}

/* CONFIRM BOOKING */
function confirmBooking() {

  var plate =
    document.getElementById("plate").value;

  var type =
    document.getElementById("vtype").value;

  fetch('http://localhost:3000/book', {

    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      plate: plate,
      type: type,
      slot: slotNumber
    })

  })

  .then(res => res.json())

  .then(data => {

    alert(data.message);

    show("screen-done");
  });
}

/* RESET */
function resetAll() {

  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("plate").value = "";
  document.getElementById("model").value = "";
  document.getElementById("owner").value = "";
  document.getElementById("btime").value = "";
  document.getElementById("duration").value = "1";

  show("screen-login");
}