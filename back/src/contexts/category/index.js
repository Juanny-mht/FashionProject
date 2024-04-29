const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");
const validateMessage = require('../../validateMessageMiddleware');
const e = require("express");

const router = Router();

/**
 * @swagger
 * /category:
 * get:
 * description: Get all categories from the database
 * responses:
 * 200:
 * description: Success
 * 400:
 * description: Error fetching category
 * 500:
 * description: Internal server error
 */
router.get("/", async (req, res) => {
    let { index, limit } = req.query;
    index = parseInt(index);
    limit = parseInt(limit);

    if (Object.keys(req.query).length === 0 ) {
        const categories = await client.category.findMany({
            include: { articles: true }
        });
        // validation de la requête de sortie
        try {
            validateMessage('allCategoriesResponse', categories, () => {
                console.log('Response is valid');
            });
        } catch (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(200).json(categories);
    }else{
        const categories = await client.category.findMany({
            include: { articles: true },
            skip: index,
            take: limit
        });
        // validation de la requête de sortie
        try {
            validateMessage('allCategoriesResponse', categories, () => {

            });
        } catch (error) {
            res.status(500).send();
            console.log(error);
            return;
        }

        res.status(200).json(categories);
    }

});

/**
 * @swagger
 * /category/{id}:
 * get:
 * description: Get a category by id from the database
 * responses:
 * 200:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const category = await client.category.findUnique({
            where: { id: id },
            include: { articles: true },
        });
        try {
            validateMessage('categoryResponse', category, () => {
                console.log('Response is valid');
            });
        } catch (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).send();
        console.log(error);
    }
});

/**
 * @swagger
 * /category/name/{name}:
 * get:
 * description: Get a category by name from the database
 * responses:
 * 200:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.get("/name/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const category = await client.category.findUnique({
            where: { name: name },
            include: { articles: true },
        });
        try {
            validateMessage('categoryResponse', category, () => {
                console.log('Body is valid');
            });
        } catch (error) {
            res.status(500).send();
            console.log(error);
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).send();
        console.log(error);
    }
});

/**
 * @swagger
 * /category/count/{id}:
 * get:
 * description: Get a category by id from the database and send count of products
 * responses:
 * 200:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.get("/count/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const category = await client.category.findUnique({
            where: { id: id },
            include: {
                articles: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (category === null) {
            res.status(500).send("Error fetching Category");
            return;
        }
        else{
        let count = category.articles.length;
            res.status(200).json({ category, count });
            validateMessage('categoryResponseCount', {category, count}, () => {
                console.log('Body is valid');
            }
        );
        }
    }
    catch (error) {
        res.status(500).send("Error fetching Category");
        return;
    }
});

/**
 * @swagger
 * /category/count/name/{name}:
 * get:
 * description: Get a category by name from the database and send count of products
 * responses:
 * 200:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.get("/count/name/:name", async (req, res) => {
    try {
    const { name } = req.params;
    const category = await client.category.findUnique({
        where: { name: name },
        include: {
            articles: {
                select: {
                    id: true,
                },
            },
        },
    });
    try {
        let count = category.articles.length;
        validateMessage('categoryResponseCount', {category, count}, () => {
        console.log('Body is valid');
        res.status(200).json({ category, count });
        });
    }
    catch (error) {
        res.status(500).send("Error fetching Category");
        return;
    }
    }
    catch (error) {
        res.status(500).send("Error fetching Category");
        return;
    }
});

/**
 * @swagger
 * /category:
 * post:
 * description: Create a new category
 * responses:
 * 201:
 * description: Success
 * 400:
 * description: Error creating category
 * 500:
 * description: Internal server error
 */
router.post("/", async (req, res) => {
    //appel de la fonction validateMessage pour valider le body de la requête
    try {
        validateMessage('categories', req.body, () => {
            console.log('Body is valid');
        });
    } catch (error) {
        res.status(400).send("Error creating Category");
        return;
    }
    const categories = req.body;
    const newCategories = [];
    for (let i = 0; i < categories.length; i++) {
        try {
            const category = await client.category.create({
                data: {
                    name: categories[i].name,
                },
            });
            newCategories.push(category);
        } catch (error) {
            console.error("Error creating category:", error);
            res.status(500).send("Error Existing Category");
            return;
        }
    }
    //appel de la fonction validateMessage pour valider le body de la réponse
    try {
        validateMessage('newCategoryRequest', newCategories, () => {
            console.log('Response is valid');
        });
    } catch (error) {
        res.status(500).send();
        console.log(error);
        return;
    }

    res.status(201).json(newCategories);
});

/**
 * @swagger
 * /category/{id}:
 * delete:
 * description: Delete a category by id
 * responses:
 * 204:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await client.category.delete({
            where: { id: id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error deleting category");
    }
});

/**
 * @swagger
 * /category/name/{name}:
 * delete:
 * description: Delete a category by name
 * responses:
 * 204:
 * description: Success
 * 500:
 * description: Internal server error
 */
router.delete("/name/:name", async (req, res) => {
    const { name } = req.params;
    try {
        await client.category.delete({
            where: { name: name },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error deleting category");
    }
});

module.exports = router;