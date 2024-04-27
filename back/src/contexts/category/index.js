const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");
const validateMessage = require('../../validateMessageMiddleware');

const router = Router();

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
            res.status(500).json({ message: error.message });
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
            res.status(500).send("Error fetching category");
            return;
        }

        res.status(200).json(categories);
    }

});

// calculate the number of products in each category and send the total number of products
/*
router.get("/count", async (req, res) => {
    const categories = await client.category.findMany({
        include: {
            articles: {
                select: {
                    id: true,
                },
            },
        },
    });
    let count = 0;
    categories.forEach((category) => {
        count += category.articles.length;
    });
    try {
        validateMessage('allCategoriesResponseCount', {categories, count}, () => {
            console.log('Body is valid');
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(200).json({ categories, count });
});

*/

// get category by id
router.get("/:id", async (req, res) => {
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
        res.status(500).send("Error fetching category");
        return;
    }
    res.status(200).json(category);
});

// get category by name
router.get("/name/:name", async (req, res) => {
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
        res.status(500).send("Error fetching category");
        return;
    }
    res.status(200).json(category);
});

// get category by id and send count of products
router.get("/count/:id", async (req, res) => {
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
    }
});

// get category by name and send count of products
router.get("/count/name/:name", async (req, res) => {
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
});

//create multiple categories
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
            console.log('Body is valid');
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
        return;
    }

    res.status(201).json(newCategories);
});

// delete category by id
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

// delete category by name
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