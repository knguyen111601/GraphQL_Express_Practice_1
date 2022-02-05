const express = require("express") // import express
const {graphqlHTTP} = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType, // lets you write dynamic types
    GraphQLString
} = require("graphql")
const app = express() 

// Schema 
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({ // Creating object with name HelloWorld that contains messages that are type strings
        name: "HelloWorld", 
        fields: ()=> ({ // fields of the object to query
            message: {
                type: GraphQLString, // Make the resolve must return a string
                resolve: (parent, args) => "Hello World" // What actual information the query should return
            }
        })
    })
})

// Routes/Router

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

// App Listener
app.listen(5000, () => console.log('Server Running'))