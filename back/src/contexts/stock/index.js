const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");

const router = Router();

//create the stock of an article by id and quantity and size
router.post("/", async (req, res) => {
    const { articleId, count, size } = req.body;
    try {
        const newStock = await client.stock.create({
            data: {
                articleId,
                count,
                size,
            },
        });
        res.status(201).json(newStock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//delete tous les stocks
router.delete("/", async (req, res) => {
    try {
        await client.stock.deleteMany();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//get all stocks
router.get("/", async (req, res) => {
    const stocks = await client.stock.findMany();
    res.status(200).json(stocks);
});

//get all stocks by articleId
router.get("/:articleId", async (req, res) => {
    const { articleId } = req.params;
    const stocks = await client.stock.findMany({
        where: {
            articleId: articleId,
        },
    });
    //get the price of the article and add it in each stock object
    const article = await client.article.findUnique({
        where: {
            id: articleId,
        },
    });
    const price = article.price;
    for (const stock of stocks) {
        stock.price = price;
    }
    res.status(200).json({ stocks});
});


module.exports = router;