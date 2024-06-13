const express = require("express");
const { catchErrors } = require("../handlers/errorHandlers");

const router = express.Router();

const adminController = require("../controllers/adminController");

const hospitalController = require("../controllers/hospitalController");



////////////////adminController//////////////////////////
router.route("/admin/create").post(catchErrors(adminController.create));
router.route("/admin/read/:id").get(catchErrors(adminController.read));
router.route("/admin/update/:id").patch(catchErrors(adminController.update));
router.route("/admin/delete/:id").delete(catchErrors(adminController.delete));
router.route("/admin/search").get(catchErrors(adminController.search));
router.route("/admin/list").get(catchErrors(adminController.list));
/////////////////////////hospitalCONTROLLER//////////////////////////hospitals
router.route("/admin/add/hospital").post(catchErrors(hospitalController.addHospital));
router.route("/admin/add/hospital/serum/:id").post(catchErrors(hospitalController.addSerumsAndVaccines));
router.route('/admin/get/hospitals').get(catchErrors(hospitalController.getAllHospitals))
router.route("/admin/update/hospital/department").patch(catchErrors(hospitalController.updateBeds))
router.route("/admin/update/hospital/:id").patch(catchErrors(hospitalController.updateHospital));  
router.route("/admin/delete/hospital/:id").delete(catchErrors(hospitalController.deleteHospital));
router.route('/admin/get/hospital/:id') .get(catchErrors(hospitalController.getHospital)) 



router
  .route("/admin/password-update/:id")
  .patch(catchErrors(adminController.updatePassword));









  ////////////////hospitalController//////////////////////////









  

module.exports = router;