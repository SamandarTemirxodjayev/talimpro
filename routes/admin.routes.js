const {Router} = require("express");
const controller = require("../controllers/superadmin.controller.js");
const middleware = require("../middlewares/admin.middleware.js");

const router = Router();

router.post("/", controller.createAdmin);
router.post("/login", controller.login);
router.post("/school", middleware, controller.createSchool);
router.get("/school", middleware, controller.getSchools);
router.patch("/school", middleware, controller.getSchoolsByRegions);
router.get("/school/:id", middleware, controller.getSchoolsById);
router.delete("/school/:id", middleware, controller.deleteSchool);
router.put("/school/:id", middleware, controller.updateSchool);
router.post("/school/permission/:id", middleware, controller.giveSchoolPermission)

module.exports = router;
