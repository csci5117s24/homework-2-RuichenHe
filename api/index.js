
const { app } = require('@azure/functions');
const { ObjectId } = require('mongodb');
const mongoClient = require("mongodb").MongoClient;


app.http('getTODOs', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'todos',
    handler: async (request, context) => {
        const client = await mongoClient.connect(process.env.AZURE_MONGO_DB)
        const todos = await client.db("test").collection("todos").find({}).toArray()
        client.close();
        const auth_header = request.headers.get('X-MS-CLIENT-PRINCIPAL')
        let token = null
        if (auth_header) {
            token = Buffer.from(auth_header, "base64");
            token = JSON.parse(token.toString());
            console.log(token.userId)
            return {
                jsonBody: {data: todos.filter(todo => todo.userid === token.userId).reverse()}
            }
        } else {
            return {
                jsonBody: {data: todos.reverse()}
            }
        }
    },
});

app.http('getTODO', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'todo/{id}',
    handler: async (request, context) => {
        const id = request.params.id;
        if (ObjectId.isValid(id)) {
            const client = await mongoClient.connect(process.env.AZURE_MONGO_DB)
            const todo = await client.db("test").collection("todos").findOne({_id: new ObjectId(id)})
            client.close();

            if (todo) {
                return {
                    jsonBody: {todo: todo}
                }
            }
        }
        return {
            status:404,
            jsonBody: {error: "no todo found by that Id"}
        }
    },
});

app.http('updateTODO', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'todo/{id}',
    handler: async (request, context) => {
        const id = request.params.id;

        const body = await request.json();
        // skipping validation -- but I can at least do some basic defaulting, and only grab the things I want.
        const title = body.title ?? "no name"
        const description = body.description ?? "no description"
        const status = body.isDone ?? "todo"
        const category = body.category ?? []
        const userid = body.userID ?? ""
        const deadline = body.deadline ?? Date().toISOString()
        
        if (ObjectId.isValid(id)) {
            const client = await mongoClient.connect(process.env.AZURE_MONGO_DB)
            // this could not possibly be the fast way to do things.
            const result = await client.db("test").collection("todos").updateOne({_id: new ObjectId(id)}, {$set: {title, description, status, category, userid, deadline}})
            

            // //Update category collections based on category input
            // const existingCategories = await client.db("test").collection("categories").find({name: {$in: category}}).toArray();
            // const existingCategoriesNames = existingCategories.map(cat => cat.name);
            // const newCategories = category.filter(cat => !existingCategoriesNames.includes(cat))

            // if (newCategories.length > 0){
            //     const newCategoriesDocs = newCategories.map(name => ({name}));
            //     await client.db("test").collection("categories").insertMany(newCategoriesDocs);
            // }

            client.close();
            if (result.matchedCount > 0) {
                return {
                    jsonBody: {status: "ok"}
                }
            }            
        }
        return {
            status:404,
            jsonBody: {error: "no deck found by that Id"}
        }
    },
});

app.http('newTODO', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'todo',
    handler: async (request, context) => {
        const client = await mongoClient.connect(process.env.AZURE_MONGO_DB)

        const body = await request.json();
        // skipping validation -- but I can at least do some basic defaulting, and only grab the things I want.
        const title = body.title ?? "no name"
        const description = body.description ?? "no description"
        const status = body.isDone ?? "todo"
        const category = body.category ?? []
        const userid = body.userID ?? ""
        const deadline = body.deadline ?? Date().toISOString()
        const payload = {title, description, status, category, userid, deadline}
        const result = await client.db("test").collection("todos").insertOne(payload)

        // //Update category collections based on category input
        // const existingCategories = await client.db("test").collection("categories").find({name: {$in: category}}).toArray();
        // const existingCategoriesNames = existingCategories.map(cat => cat.name);
        // const newCategories = category.filter(cat => !existingCategoriesNames.includes(cat))

        // if (newCategories.length > 0){
        //     const newCategoriesDocs = newCategories.map(name => ({name}));
        //     await client.db("test").collection("categories").insertMany(newCategoriesDocs);
        // }


        client.close();
        return{
            status: 201, /* Defaults to 200 */
            jsonBody: {_id: result.insertedId, title, description, status, category, deadline, userid}
        };
    },
});

app.http('getCategories', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'categories',
    handler: async (request, context) => {
        const auth_header = request.headers.get('X-MS-CLIENT-PRINCIPAL')
        let token = null
        const client = await mongoClient.connect(process.env.AZURE_MONGO_DB)
        const categories = await client.db("test").collection("categories").find({}).toArray()
        client.close();
        if (auth_header) {
            token = Buffer.from(auth_header, "base64");
            token = JSON.parse(token.toString());
            return {
                jsonBody: {data: categories.filter(category => category.userid === token.userId).reverse()}
            }
        } else {
            return {
                jsonBody: {data: categories.reverse()}
            }
        }
    },
});

app.http('newCategory', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'category',
    handler: async (request, context) => {
        const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);

        const body = await request.json();
        // skipping validation -- but I can at least do some basic defaulting, and only grab the things I want.
        const name = body.name?.trim();

        // Check for an empty or undefined name
        if (!name) {
            client.close();
            return {
                status: 400, // Bad Request
                jsonBody: { error: "Category name is required." }
            };
        }
        const userid = body.userID ?? ""
        const existingCategory = await client.db("test").collection("categories").findOne({ name: name, userid: userid});
        if (existingCategory) {
            client.close();
            return {
                status: 409, // Conflict
                jsonBody: { error: "A category with this name already exists." }
            };
        }
        const payload = {name, userid}
        const result = await client.db("test").collection("categories").insertOne(payload)

        client.close();
        return{
            status: 201, /* Defaults to 200 */
            jsonBody: {_id: result.insertedId, name, userid}
        };
    },
});

app.http('deleteCategory', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'category/{name}',
    handler: async (request, context) => {
        const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);
        const category = request.params.name;
        //FIrst delete the category from the collection
        const auth_header = request.headers.get('X-MS-CLIENT-PRINCIPAL');
        let token = {
            userid: "",
        };
        if (auth_header) {
            token = Buffer.from(auth_header, "base64");
            token = JSON.parse(token.toString());
        }

        const categoryResult = await client.db("test").collection("categories").deleteOne({name: category, userid: token.userId});
        if (categoryResult.deletedCount === 1){
            await client.db("test").collection("todos").updateMany(
                {category: category, userid: token.userId},
                {$pull: {category: category}}
            );
            client.close()

            return {
                status: 200,
                jsonBody: {message: `Category was successfully deleted and to-do items updated.`}
            };
        } else {
            client.close();
            return {
                status: 404,
                jsonBody: {message: `Failed`}
            };
        }
    },
});

app.http('getTODOsByCategory', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'todos/{category}',
    handler: async (request, context) => {
        const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);
        const category = request.params.category;

        //FIrst delete the category from the collection
        const auth_header = request.headers.get('X-MS-CLIENT-PRINCIPAL')
        let token = null
        const todos = await client.db("test").collection("todos").find({ category: category}).toArray();

        client.close()

        if (todos.length > 0){
            if (auth_header) {
                token = Buffer.from(auth_header, "base64");
                token = JSON.parse(token.toString());
                return {
                    statis: 200,
                    jsonBody: {data: todos.filter(todo => todo.userid === token.userId).reverse()}
                };
            } else {
                return {
                    statis: 200,
                    jsonBody: {data: todos.reverse()}
                };
            }
            
        } else {
            return {
                statis: 404,
                jsonBody: {message: "No todo items found under that category"}
            };
        }
        
    },
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.http('flipCoin', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'coin',
    handler: async (request, context) => {
        sleep(1000);
        if (Math.random() > 0.5){
            return {
                statis: 200,
                jsonBody: {data: "face"}
            };
        } else {
            return {
                statis: 500,
                jsonBody: {data: "tail"}
            };
        }
    },
    
});

