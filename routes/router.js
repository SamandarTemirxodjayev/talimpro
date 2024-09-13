const adminRouter = require("./admin.routes.js");
const schoolRouter = require("./schools.routes.js");
const infoRouter = require("./info.routes.js");
const teachersRouter = require("./teachers.routes.js");
const translationsRouter = require("./translations.routes.js");
const pupilsRouter = require("./pupils.routes.js");
const {Router} = require("express");
const router = Router();

router.use("/superadmin", adminRouter);
router.use("/schools", schoolRouter);
router.use("/info", infoRouter);
router.use("/teachers", teachersRouter);
router.use("/translations", translationsRouter);
router.use("/pupils", pupilsRouter);

module.exports = router;
