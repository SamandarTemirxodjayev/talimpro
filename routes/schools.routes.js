const {Router} = require("express");
const controller = require("../controllers/schools.controller.js");
const middleware = require("../middlewares/schools.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.post("/reset-password", middleware, controller.resetPassword);
router.post("/teacher/update-password/:id", middleware, controller.updateTeacherPassword);
router.post("/teacher", middleware, controller.createTeacher);
router.get("/teacher", middleware, controller.getTeachers);
router.get("/teacher/:id", middleware, controller.getTeacherById);
router.delete("/teacher/:id", middleware, controller.deleteTeacher);
router.put("/teacher/:id", middleware, controller.updateTeacher);

module.exports = router;
