const {Router} = require("express");
const controller = require("../controllers/teachers.controller.js");
const middleware = require("../middlewares/teachers.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.get("/me", middleware, controller.getMe);
router.post("/profile", middleware, controller.updateProfile);
router.get("/tests", middleware, controller.getTests);
router.get("/test/:id", middleware, controller.getTestById);
router.get("/tests/start/:id", middleware, controller.startTest);
router.get("/active-tests", middleware, controller.getActiveTests);

module.exports = router;
