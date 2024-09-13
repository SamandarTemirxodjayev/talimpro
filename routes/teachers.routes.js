const {Router} = require("express");
const controller = require("../controllers/teachers.controller.js");
const middleware = require("../middlewares/teachers.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.get("/me", middleware, controller.getMe);
router.post("/profile", middleware, controller.updateProfile);
router.post("/reset-password", middleware, controller.resetPassword);

module.exports = router;
