
async function articleController (req, res)  {
    let { index, limit } = req.query;
    index = parseInt(index);
    limit = parseInt(limit);

    console.log(index, limit);
    if (Object.keys(req.query).length === 0 ) {
        const articles = await client.article.findMany({
            include: { category: true }
        });
        res.status(200).json(articles);
    }else{
        const articles = await client.article.findMany({
            include: { category: true },
            skip: index,
            take: limit
        });

        res.status(200).json(articles);
    }
}