const adminRouter = require("./admin.routes.js");
const schoolRouter = require("./schools.routes.js");
const {Router} = require("express");
const router = Router();

router.use("/superadmin", adminRouter);
router.use("/schools", schoolRouter);

module.exports = router;
