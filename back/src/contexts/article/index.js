const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");
const validateMessage = require('../../validateMessageMiddleware');

const router = Router();

/**
 * @swagger
 * /article:
 *  get:
 *  description: Get all articles from the database
 * responses:
 * 200:
 * description: Success
 * 400:
 * description: Error : Article category does not exist.
 * 500:
 * description: Internal server error
 */
router.get("/", async (req, res) => {
    const query = {};
    for (let key in req.query) {
        query[key.toLowerCase()] = req.query[key];
    }

    let index = query.index ? parseInt(query.index) : null;
    let limit = query.limit ? parseInt(query.limit) : null; 
    let category = query.category ? query.category : null;

    try {
        let articles;
        let whereClause = {};

        if (category) {
            const existingCategory = await client.category.findUnique({
                where: {
                    name: category
                }
            });

            if (!existingCategory) {
                return res.status(400).send("Error : Article category does not exist.");
            }

            whereClause.category = {
                name: category
            };
        }

        if (index != null && limit != null) {
            articles = await client.article.findMany({
                include: { category: true },
                skip: index,
                take: limit,
                where: whereClause
            });
        } else {
            articles = await client.article.findMany({
                include: { category: true },
                where: whereClause
            });
        }

        try {
            validateMessage('allArticlesResponse', articles, () => {
                console.log('Response is valid');
            });
        }
        catch (error) {
            res.status(500).send();
            return;
        }

        res.status(200).json(articles);
    } catch (error) {
        res.status(500).send();
    }
});

/**
 * @swagger
 * /article/{id}:
 * get:
 * description: Get an article by id from the database
 * responses:
 * 200:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
    const article = await client.article.findUnique({
        where: {
            id: id,
        },
        include: {
            count: true,
        },
    });
    //delete count.ArticleId in response
    for (const count of article.count) {
        delete count.articleId;
    }
    const category = await client.category.findUnique({
        where: {
            id: article.categoryId,
        },
    });
    article.category = category.name;
    delete article.categoryId;

    try {
        validateMessage('articleResponse', article, () => {
            console.log('Response is valid');
        });
    }
    catch (error) {
        res.status(500).send();
        console.log(error);
        return;
    }

    res.status(200).json(article);
    }
    catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).send("Error : fetching article failed.");
        return;
    }
});

/**
 * @swagger
 * /article:
 * post:
 * description: Create an article in the database
 * responses:
 * 201:
 * description: Article(s) created
 * 400:
 * description: Error creating article
 * 500:
 * description: Internal server error
 */
router.post("/", async (req, res) => {
    //appel de la fonction validateMessage pour valider le body de la requête
    try {
        validateMessage('articles', req.body, () => {
        console.log('Body is valid');
        });
    } catch (error) {
        res.status(400).send("Error creating article");
        return;
    }
    const articles = req.body;
    const newArticles = [];
    for (const articleData of articles) {
        const { description,  price, category} = articleData;
        try {
            //verifier d'abord si l'article existe deja avant de le creer
            const existingArticle = await client.article.findFirst({
                where: {
                    description: description,
                    price: price,
                    category : category
                },
            });
            if (existingArticle) {
                res.status(400).send("Error : Article(s) existing");
                return;
            }
            const newArticle = await client.article.create({
                data: {
                    description,
                    price,
                    category: {
                        connect: {
                            id: category.id,
                        }
                    }
            },include: {
                category: true
            }
        });
            newArticles.push(newArticle);
        } catch (error) {
            console.error("Error creating article:", error);
            res.status(500).send("Error creating article");
            return; 
        }
    }

    try {
        validateMessage('newArticleRequest', { message: "Les articles ont été créés avec succès.", newArticles }, () => {
            console.log('Body is valid');
        });
    }
    catch (error) {
        res.status(500).send();
        console.log(error);
        return;
    }

    res.status(201).send("Article(s) created");
}
);

/**
 * @swagger
 * /article/{id}:
 * delete:
 * description: Delete an article by id from the database
 * responses:
 * 204:
 * description: Article deleted
 * 500:
 * description: Internal server error
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
    await client.article.delete({
        where: {
            id: id,
        },
    });
    res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).send();
    }
}
);

module.exports = router;