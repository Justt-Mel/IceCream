const pg = require ('pg')
const express = require('express')
const app= express()
const client = new pg.Client('postgres://artma:postgres@localhost/flavors')
const morgan = require('morgan')
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/flavors', async(req, res, next)=>{
    try {
        const SQL =
        `SELECT *
        FROM flavors
        `
        const response = await client.query(SQL);
        console.log(response)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.get('/api/flavors/:id', async (req,res,next) =>{
    try {
        const SQL =
        `
        SELECT *
        FROM flavors
        WHERE id = $1
        `
        const response = await client.query(SQL,[req.params.id])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.post('/api/flavors', async (req,res,next) =>{
    try {
        console.log(req.body)
        const SQL =
        `
        INSERT INTO flavors(flavor,price,instock)
        VALUES ($1,$2,$3)
        RETURNING *
        `
        const response = await client.query(SQL, [req.body.flavor, req.body.price, req.body.instock])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

app.delete('/api/flavors/:id',async(req,res,next)=>
{
    try {
        const SQL =`
        DELETE 
        FROM flavors
        WHERE id = $1
        `
        await client.query(SQL,[req.params.id])
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

app.put('/api/flavors/:id', async(req, res,next) =>{
  try {
      const SQL =`
    UPDATE flavors
    SET flavor = $1, price = $2, instock = $3
    WHERE id = $4
    RETURNING *
    `
    const response = await client.query(SQL, [req.body.flavor, req.body.price, req.body.instock, req.params.id])
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})

const init = async () =>
{
await client.connect();
console.log ("DataBase Connected");

let SQL= ``;
await client.query(SQL);
console.log('Table Created');

SQL= `
DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors(
id SERIAL PRIMARY KEY,
flavor VARCHAR(50),
price FLOAT,
instock BOOLEAN DEFAULT TRUE
);
INSERT INTO flavors (flavor, price, instock) VALUES ('Chocolate','3.50','true');
INSERT INTO flavors (flavor, price, instock) VALUES ('Strawberry','2','false');
INSERT INTO flavors (flavor, price, instock) VALUES ('Vanilla','3','true');
INSERT INTO flavors (flavor, price, instock) VALUES ('Butter Pecan','4.50','true');
`

await client.query(SQL);
console.log('Data Seeded');
    const PORT = 3000
    app.listen(PORT, ()=>{
        console.log(`listening on port${PORT}`)

    })
};

init()