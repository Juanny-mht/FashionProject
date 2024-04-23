const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");
const validateMessage = require('../../validateMessageMiddleware');

const router = Router();

// Get all articles with pagination and category filter
router.get("/", async (req, res) => {
    const query = {};
    for (let key in req.query) {
        query[key.toLowerCase()] = req.query[key];
    }

    let index = query.index ? parseInt(query.index) : null;
    let limit = query.limit ? parseInt(query.limit) : null; 
    let category = query.category ? query.category.toLowerCase() : null;

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
                return res.status(500).send("La catégorie spécifiée n'existe pas.");
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

        res.status(200).json(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).send("Une erreur s'est produite lors de la récupération des articles.");
    }
});


//get detail for one article with id as param in
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
    res.status(200).json(article);
    }
    catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).send("Une erreur s'est produite lors de la récupération de l'article.");
    }
});


//create many articles
router.post("/", async (req, res) => {
    //appel de la fonction validateMessage pour valider le body de la requête
    try {
        validateMessage('Articles', req.body, () => {
        console.log('Body is valid');
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    const articles = req.body;
    const newArticles = [];
    for (const articleData of articles) {
        const { description,  price, category} = articleData;
        try {
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
            res.status(500).send("Une erreur s'est produite lors de la création d'un ou plusieurs articles.");
            return; 
        }
    }
    res.status(201).json({ message: "Les articles ont été créés avec succès.", newArticles });
}
);
//delete an article
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
    await client.article.delete({
        where: {
            id: id,
        },
    });
    res.status(204).end();
    }
    catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).send("Une erreur s'est produite lors de la suppression de l'article.");
    }
}
);

module.exports = router;