const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");

const router = Router();

router.get("/", async (req, res) => {
    const categories = await client.category.findMany();
    res.status(200).json(categories);
});

module.exports = router;