const { Router } = require("express");

const router = Router();

router.use("/categories", require("./category"));

router.use("/articles", require("./article"));


module.exports = router;