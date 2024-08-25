const {Router} = require("express");
const controller = require("./controller.js");

const router = Router();

router.get("/", controller.index);
router.post("/upload", controller.upload);

module.exports = router;
