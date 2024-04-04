const { Router } = require("express");
const { client } = require("../../infrastructure/database/database");

const router = Router();

//seulement pagination dans category, voir s'il faut faire filtre
router.get("/", async (req, res) => {
    let { index, limit } = req.query;
    index = parseInt(index);
    limit = parseInt(limit);

    if (Object.keys(req.query).length === 0 ) {
        const categories = await client.category.findMany({
            include: { articles: true }
        });
        res.status(200).json(categories);
    }else{
        const categories = await client.category.findMany({
            include: { articles: true },
            skip: index,
            take: limit
        });

        res.status(200).json(categories);
    }

});

// calculate the number of products in each category and send the total number of products
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
    res.status(200).json({ categories, count });
});

// get category by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const category = await client.category.findUnique({
        where: { id: id },
    });
    res.status(200).json(category);
});

// get category by name
router.get("/name/:name", async (req, res) => {
    const { name } = req.params;
    const category = await client.category.findUnique({
        where: { name: name },
    });
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
    res.status(200).json(category);
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
    res.status(200).json(category);
});

//create category
router.post("/", async (req, res) => {
    const { name } = req.body;
    const category = await client.category.create({
        data: {
            name: name,
        },
    });
    res.status(201).json(category);
});

//create multiple categories
router.post("/many", async (req, res) => {
    const categories = req.body;
    const newCategories = [];
    for (let i = 0; i < categories.length; i++) {
        const category = await client.category.create({
            data: {
                name: categories[i].name,
            },
        });
        newCategories.push(category);
    }
    res.status(201).json(newCategories);
});

// delete category by id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const category = await client.category.delete({
        where: { id: id },
    });
    res.status(200).json(category);
});

// delete category by name
router.delete("/name/:name", async (req, res) => {
    const { name } = req.params;
    const category = await client.category.delete({
        where: { name: name },
    });
    res.status(200).json(category);
});

module.exports = router;