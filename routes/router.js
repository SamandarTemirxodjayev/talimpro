const adminRouter = require("./admin.routes.js");
const {Router} = require("express");
const router = Router();

router.use("/superadmin", adminRouter);

module.exports = router;
