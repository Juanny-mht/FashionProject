const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");

const router = Router();

router.get("/", async (req, res) => {
    const articles = await client.article.findMany();
    for (const article of articles) {
        const category = await client.category.findUnique({
            where: {
                id: article.categoryId,
            },
        });
        article.category = category.name;
    }
    res.status(200).json(articles);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
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
});


router.get("/:id/count", async (req, res) => {
    const { id } = req.params;
    const count = await client.author.findUnique({
        where: {
            articles: {
                some: {
                    id: id
                }
            }
        }
    });
    res.status(200).json(count);
}
);


router.post("/", async (req, res) => {
    const { description, price, category } = req.body;
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
            },
            include: {
                category: true,
            },
        });
        res.status(201).json(newArticle);
    } catch (error) {
        console.error("Error creating article:", error);
        res.status(500).send("Une erreur s'est produite lors de la création de l'article.");
    }
}
);


router.post("/many", async (req, res) => {
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
            // Si une erreur se produit lors de la création d'un article, vous pouvez ajouter une logique de gestion des erreurs ici
            // Par exemple, vous pouvez envoyer une réponse d'erreur appropriée au client
            res.status(500).send("Une erreur s'est produite lors de la création d'un ou plusieurs articles.");
            return; // Terminer la fonction pour éviter de créer des articles en double ou d'autres problèmes
        }
    }
    
    // Une fois que tous les articles ont été créés avec succès, vous pouvez envoyer une réponse indiquant que tout s'est bien passé
    res.status(201).json({ message: "Les articles ont été créés avec succès.", newArticles });
}
);


module.exports = router;