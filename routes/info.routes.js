const {Router} = require("express");
const controller = require("../controllers/info.controller.js");

const router = Router();

router.get("/statistics", controller.getStatistics);

module.exports = router;
