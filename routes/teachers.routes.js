const {Router} = require("express");
const controller = require("../controllers/teachers.controller.js");
const middleware = require("../middlewares/teachers.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.get("/tests", middleware, controller.getTests);

module.exports = router;
