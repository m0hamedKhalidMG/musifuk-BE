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

router
  .route("/admin/password-update/:id")
  .patch(catchErrors(adminController.updatePassword));









  ////////////////hospitalController//////////////////////////









  

module.exports = router;