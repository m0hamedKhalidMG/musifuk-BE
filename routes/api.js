const express = require("express");
const { catchErrors } = require("../handlers/errorHandlers");

const router = express.Router();

const adminController = require("../controllers/adminController");
const profileDriver = require("../controllers/ambulance/profiledriver/ProfileDriverController");
const RequestsController = require("../controllers/ambulance/RequestsController");

const driverController = require("../controllers/ambulance/driverController");
const ambulanceController = require("../controllers/ambulance/CarController");
const _authController = require("../controllers/authController");

////////////////adminController//////////////////////////
router.route("/admin/create").post(catchErrors(adminController.create));
router.route("/admin/read/:id").get(catchErrors(adminController.read));
router.route("/admin/update/:id").patch(catchErrors(adminController.update));
router.route("/admin/delete/:id").delete(catchErrors(adminController.delete));
router.route("/admin/search").get(catchErrors(adminController.search));
router.route("/admin/list").get(catchErrors(adminController.list));
/////////////////////////hospitalCONTROLLER//////////////////////////hospitals




router
  .route("/admin/password-update/:id")
  .patch(catchErrors(adminController.updatePassword));

////////////////ambulance driver Controller//////////////////////////

router
  .route("/ambulance/driver")
  .get(catchErrors(driverController.list))
  .post(driverController.create);
router
  .route("/ambulance/driver/:id")
  .delete(catchErrors(driverController.delete))
  .patch(catchErrors(driverController.update));

////////////////ambulance car Controller//////////////////////////

router
  .route("/ambulance/car")
  .get(catchErrors(ambulanceController.list))
  .post(catchErrors(ambulanceController.create))
  .patch(catchErrors(ambulanceController.updateCoordinates));
router
  .route("/ambulance/car/:id")
  .delete(catchErrors(ambulanceController.delete))
  .patch(catchErrors(ambulanceController.update));

////////////////hospitalController//////////////////////////

////////////////requestcarController//////////////////////////

router
  .route("/ambulance/requestscar")
  .get(catchErrors(RequestsController.getAmbulanceRequests))
  .post(catchErrors(RequestsController.createAmbulanceRequest))
  .patch(RequestsController.assignCarToRequest);

router
  .route("/ambulance/request/markPatientsAsDelivered")
  .patch(RequestsController.markPatientsAsDelivered);

router
  .route("/ambulance/requestscar/:id")
  .delete(catchErrors(RequestsController.deleteAmbulanceRequest));

///////////driverProfile/////////

router
  .route("/ambulance/driverProfile")
  .all(_authController.isDriver)
  .get(catchErrors(profileDriver.getDriverDetails));

router
  .route("/ambulance/driver/requestscars/:carId")
  .all(_authController.isDriver)
  .get(catchErrors(profileDriver.getRequestsByCar));

router
  .route("/ambulance/car/status")
  .post(_authController.isDriver, profileDriver.updateCarStatus);
module.exports = router;
