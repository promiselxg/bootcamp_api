const advancedResults = (model, populate) => async (req, res, next) => {
    //@DESC Advanced Filtering , Querying , Sorting , Pagination 
    // 1.using [req.query] 
    let query;
    //make a copy of the reqQuery
    const reqQuery = {
        ...req.query
    }

    //  2. Fields to Exclude in SEARCH QUERY
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //  Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param])

    //create query STRING
    let queryStr = JSON.stringify(reqQuery)

    // Create Operator ($gt,$gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // Finding Resource in DB
    query = model.find(JSON.parse(queryStr));

    // Select Fields [eg: select=name,description]
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        //  prepare query string
        query = query.select(fields)
    }

    // SORT [eg: sort:-name] where ( - ) descending
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        //  prepare query string
        query = query.sort(sortBy)
    } else {
        //  prepare query string
        query = query.sort('-createdAt'); //sort by Descending Order
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25; // 100 model per Page
    const startIndex = (page - 1) * limit; // Start
    const endIndex = page * limit; // End
    const total = await model.countDocuments(); // Method used to count all documents

    //  prepare query string
    query = query.skip(startIndex).limit(limit)

    //  Generic Populate Query
    if (populate) {
        query = query.populate(populate)
    }

    //executing query
    const results = await query;

    //  pagination Result
    const pagination = {}

    // Condition to display Previous button
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    // condition to display Next button
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    //  Object Created on the res Object so that this can be used by any resoure
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next();
};

module.exports = advancedResults;