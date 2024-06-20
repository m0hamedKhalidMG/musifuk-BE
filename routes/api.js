const express = require("express");
const { catchErrors } = require("../handlers/errorHandlers");

const router = express.Router();

const adminController = require("../controllers/adminController");
const profileDriver = require("../controllers/ambulance/profiledriver/ProfileDriverController");
const RequestsController = require("../controllers/ambulance/RequestsController");
const hospitalController = require('../controllers/hospitalController');

const driverController = require("../controllers/ambulance/driverController");
const ambulanceController = require("../controllers/ambulance/CarController");
const _authController = require("../controllers/authController");

////////////////adminController//////////////////////////

router
  .route("/admin/create")
  .all(_authController.IsAdmin)
  .post(catchErrors(adminController.create));
router
  .route("/admin/read/:id")
  .all(_authController.IsAdmin)
  .get(catchErrors(adminController.read));
router
  .route("/admin/update/:id")
  .all(_authController.IsAdmin)
  .patch(catchErrors(adminController.update));
router
  .route("/admin/delete/:id")
  .all(_authController.IsAdmin)
  .delete(catchErrors(adminController.delete));
router
  .route("/admin/search")
  .all(_authController.IsAdmin)
  .get(catchErrors(adminController.search));
router
  .route("/admin/list")
  .all(_authController.IsAdmin)
  .get(catchErrors(adminController.list));

router
  .route("/admin/password-update/:id")
  .all(_authController.IsAdmin)
  .patch(catchErrors(adminController.updatePassword));

////////////////ambulance driver Controller//////////////////////////

router
  .route("/ambulance/driver")
  .all(_authController.IsAdmin)
  .get(catchErrors(driverController.list))
  .post(driverController.create);
router
  .route("/ambulance/driver/:id")
  .all(_authController.IsAdmin)
  .delete(catchErrors(driverController.delete))
  .patch(catchErrors(driverController.update));

////////////////ambulance car Controller//////////////////////////

router
  .route("/ambulance/car")
  .all(_authController.IsAdmin)
  .get(catchErrors(ambulanceController.list))
  .post(catchErrors(ambulanceController.create))
  .patch(catchErrors(ambulanceController.updateCoordinates));
router
  .route("/ambulance/car/:id")
  .all(_authController.IsAdmin)
  .delete(catchErrors(ambulanceController.delete))
  .patch(catchErrors(ambulanceController.update));

router.post('/assign', RequestsController.assignHospitalToPatient);
////////////////hospitalController//////////////////////////
router.post('/hospitals/create', hospitalController.createHospital);
router.post(
  "/hospitals/filter",
  _authController.IsAdmin,
  RequestsController.filterHospitals
);
////////////////requestcarController//////////////////////////
router.get(
  "/getAllDescribeSate",
  _authController.IsAdmin,
  RequestsController.getAllDescribeSate
);
router.get(
  "/getDescribeSateById/:id",
  _authController.IsAdmin,
  RequestsController.getDescribeSateById
);

router
  .route("/ambulance/requestscar")
  .get(catchErrors(RequestsController.getAmbulanceRequests))
  .post(catchErrors(RequestsController.createAmbulanceRequest))
  .patch(RequestsController.assignCarToRequest);

router
  .route("/ambulance/request/markPatientsAsDelivered")
  .all(_authController.isDriver)
  .patch(RequestsController.markPatientsAsDelivered);

router
  .route("/ambulance/requestscar/:id")
  .all(_authController.IsAdmin)
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
  .route("/ambulance/CarStatus")
  .all(_authController.isDriver)
  .post(profileDriver.updateCarStatus);
router
  .route("/update-delivery-status/:requestId/:carId")
  .all(_authController.isDriver)

  .put(profileDriver.updatedeliverystatus);
router
  .route("/update-last-location/:carId")
  .all(_authController.isDriver)
  .put(profileDriver.updateLastLocation);
router
  .route("/describe-sate")
  .all(_authController.isDriver)
  .post(profileDriver.createDescribeSate);

module.exports = router;
