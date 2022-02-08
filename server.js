const express = require("express") // import express
const {graphqlHTTP} = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType, // lets you write dynamic types
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require("graphql")
const app = express() 

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

// // Schema 
// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({ // Creating object with name HelloWorld that contains messages that are type strings
//         name: "HelloWorld", 
//         fields: ()=> ({ // fields of the object to query
//             message: {
//                 type: GraphQLString, // Make the resolve must return a string
//                 resolve: (parent, args) => "Hello World" // What actual information the query should return
//             }
//         })
//     })
// })

// Root Query

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents an author of a book",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) }, // Id is an integer that cannot be null
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => author.id === book.authorId) //.filter to return the array of matching books
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book written by an author",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) }, // Id is an integer that cannot be null
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType, // Custom author type to retrieve the details of author
            resolve: (book) => { // book in the parameter is the "parent" argument
                return authors.find(author => author.id === book.authorId) // return where the ids match
            }    
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        book: { // Query for a single book
            type: BookType,
            description: "Single Book",
            args: { // declare what kind of arguments can be taken 
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id) // return matching 
        },
        books: {
            type: new GraphQLList(BookType), // custom GraphQL Type for list of all books
            description: "List of all books",
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: "Single Author",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => args.id === author.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all authors",
            resolve: () => authors
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType
})


// Routes/Router

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

// App Listener
app.listen(5000, () => console.log('Server Running'))