const adminRouter = require("./admin.routes.js");
const schoolRouter = require("./schools.routes.js");
const infoRouter = require("./info.routes.js");
const {Router} = require("express");
const router = Router();

router.use("/superadmin", adminRouter);
router.use("/schools", schoolRouter);
router.use("/info", infoRouter);

module.exports = router;
