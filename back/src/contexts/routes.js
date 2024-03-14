const { Router } = require("express");

const router = Router();

router.use("/categories", require("./category"));

router.use("/articles", require("./article"));

router.use("/stocks", require("./stock"));


module.exports = router;