const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");

const router = Router();

router.get("/", async (req, res) => {
    const articles = await client.article.findMany();
    res.status(200).json(articles);
});


module.exports = router;