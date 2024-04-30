const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");
const validateMessage = require('../../validateMessageMiddleware');

const router = Router();

/**
 * @swagger
 * /stock:
 * post:
 * description: Create new stocks
 * responses:
 * 201:
 * description: Success
 * 400:
 * description: Error : Invalid request body.
 * 500:
 * description: Internal server error
 */
router.post("/", async (req, res) => {
    //appel de la fonction validateMessage pour valider le body de la requête avec JOI
    try {
        validateMessage('stocks', req.body, () => {
            console.log('Body is valid');
        });
    } catch (error) {
        res.status(400).send("Error : Invalid request body.");
        console.log(error);
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
                res.status(400).send("Error : Stock existing in article(s).");
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
            res.status(500).send("Error creating stock");
            return;
        }
    }

    try {
        validateMessage('newStockRequest', { message: "Les stocks ont été créés avec succès.", newStocks }, () => {
            console.log('Response is valid');
        });
    } catch (error) {
        res.status(500).send("Error creating stock");
        console.log(error);
        return;
    }

    res.status(201).send("Les stocks ont été créés avec succès.");
});

/**
 * @swagger
 * /stock:
 * delete:
 * description: Delete all stocks
 * responses:
 * 204:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.delete("/", async (req, res) => {
    try {
        await client.stock.deleteMany();
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error deleting articles");
        console.log(error);
    }
});

/**
 * @swagger
 * /stock:
 * get:
 * description: Get all stocks
 * responses:
 * 200:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.get("/", async (req, res) => {
    const stocks = await client.stock.findMany();
    try {
        validateMessage('allStocksResponse', stocks, () => {
            console.log('Response is valid');
        });
    } catch (error) {
        res.status(500).send();
        console.log(error);
        return;
    }
    res.status(200).json(stocks);
});

/**
 * @swagger
 * /stock/{articleId}:
 * get:
 * description: Get stocks by articleId
 * responses:
 * 200:
 * description: Success
 * 500:
 * description: Internal server error
 * 400:
 * description: Error fetching stock
 */
router.get("/:articleId", async (req, res) => {
    try {
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
        res.status(400).send("Error fetching stock");
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
        res.status(500).send("Error fetching stock");
        console.log(error);
        return;
    }
    res.status(200).json(stocks);
    }
    catch (error) {
        res.status(500).send("Error fetching stock");
    }
});

/**
 * @swagger
 * /stock/{articleId}:
 * put:
 * description: Update stock by articleId
 * responses:
 * 200:
 * description: Success
 * 500:
 * description: Internal server error
 * 400:
 * description: Error modifying stock
 */
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
            res.status(400).send("Error modifying stock");
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