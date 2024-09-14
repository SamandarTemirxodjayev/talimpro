const {Router} = require("express");
const controller = require("../controllers/pupils.controller.js");
const middleware = require("../middlewares/pupils.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.get("/me", middleware, controller.getme);
router.post("/profile", middleware, controller.updatePupilProfile);

module.exports = router;
