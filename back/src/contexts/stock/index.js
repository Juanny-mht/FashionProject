const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");
const validateMessage = require('../../validateMessageMiddleware');

const router = Router();

//create the stock of an article by id and quantity and size
// create one or many stocks
router.post("/", async (req, res) => {
    //appel de la fonction validateMessage pour valider le body de la requête avec JOI
    try {
        validateMessage('stocks', req.body, () => {
            console.log('Body is valid');
        });
    } catch (error) {
        res.status(400).send("Error : Invalid request body.");
        return;
    }
    const stocks = req.body;
    const newStocks = [];
    for (const stockData of stocks) {
        const { articleId, count, size } = stockData;
        try {
            //verifier d'abord dans le stock de l'article existant si le stock existe deja avant de le creer
            const existingStock = await client.stock.findFirst({
                where: {
                    articleId: articleId,
                    size: size,
                },
            });
            if (existingStock) {
                res.status(500).send("Error : Stock existing in article(s).");
                return;
            }
            const newStock = await client.stock.create({
                data: {
                    articleId,
                    count,
                    size,
                },
            });
            newStocks.push(newStock);
        } catch (error) {
            res.status(400).send("Error creating stock");
            return;
        }
    }

    try {
        validateMessage('newStockRequest', { message: "Les stocks ont été créés avec succès.", newStocks }, () => {
            console.log('Response is valid');
        });
    } catch (error) {
        res.status(500).send("Error creating stock");
        return;
    }

    res.status(201).send("Les stocks ont été créés avec succès.");
});

//delete tous les stocks
router.delete("/", async (req, res) => {
    try {
        await client.stock.deleteMany();
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error deleting articles");
    }
});

//delete tous les stocks d'un article
router.delete("/:articleId", async (req, res) => {
    const { articleId } = req.params;
    try {
        await client.stock.delete({
            where: {
                articleId: articleId,
            },
        });
    res.status(204).end();
    } catch (error) {
        res.status(400).send("Error deleting articles");
        return;
    }
});

//get all stocks
router.get("/", async (req, res) => {
    const stocks = await client.stock.findMany();
    try {
        validateMessage('allStocksResponse', stocks, () => {
            console.log('Response is valid');
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.status(200).json(stocks);
});

//get all stocks by articleId => error if articleId doesn't exist
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
    if (article === null) {
        res.status(500).send("Error fetching stock");
        return;
    }
    const price = article.price;
    for (const stock of stocks) {
        stock.price = price;
    }
    try {
        validateMessage('allStocksResponse', stocks, () => {
            console.log('Response is valid');
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(200).json(stocks);
});

//modify the stock of an article by id and size
router.put("/:articleId", async (req, res) => {
    const { articleId } = req.params;
    const { count, size } = req.body;

    try {
        validateMessage('stockUpdate', req.body, () => {
            console.log('Body is valid');
        });
    } catch (error) {
        res.status(400).send("Error modifying stock");
        return;
    }

    try {
        //verifier d'abord si le stock existe avant de le modifier
        const existingStock = await client.stock.findFirst({
            where: {
                articleId: articleId,
                size: size,
            },
        });
        if (!existingStock) {
            res.status(500).send("Error modifying stock");
            return;
        }
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
        try {
            validateMessage('allStocksResponse', newStock, () => {
                console.log('Response is valid');
            });
        } catch (error) {
            res.status(500).send("Error modifying stock");
            return;
        }
        res.status(200).json(newStock);
    } catch (error) {
        res.status(500).send("Error modifying stock");
    }
}
);


module.exports = router;