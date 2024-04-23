const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");
const validateMessage = require('../../validateMessageMiddleware');

const router = Router();

//create the stock of an article by id and quantity and size
// create one or many stocks
router.post("/", async (req, res) => {
    //appel de la fonction validateMessage pour valider le body de la requête
    try {
        validateMessage('Stocks', req.body, () => {
            console.log('Body is valid');
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    const stocks = req.body;
    const newStocks = [];
    for (const stockData of stocks) {
        const { articleId, count, size } = stockData;
        try {
            const newStock = await client.stock.create({
                data: {
                    articleId,
                    count,
                    size,
                },
            });
            newStocks.push(newStock);
        } catch (error) {
            console.error("Error creating stock:", error);
            res.status(500).send("Une erreur s'est produite lors de la création d'un ou plusieurs stocks.");
            return;
        }
    }
    res.status(201).json({ message: "Les stocks ont été créés avec succès.", newStocks });
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

//modify the stock of an article by id and size
router.put("/:articleId", async (req, res) => {
    const { articleId } = req.params;
    const { count, size } = req.body;
    try {
        const stock = await client.stock.updateMany({
            where: {
                articleId: articleId,
                size: size,
            },
            data: {
                count,
            },
        });
        //print the new stock in response
        const newStock = await client.stock.findMany({
            where: {
                articleId: articleId,
                size: size,
            },
        });
        res.status(200).json(newStock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);


module.exports = router;