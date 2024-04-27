const { Router } = require("express");

const router = Router();

router.use("/category", require("./category"));

router.use("/article", require("./article"));

router.use("/stock", require("./stock"));


module.exports = router;