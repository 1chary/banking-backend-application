const express = require("express");
const app = express();
const path = require("path");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname,"userdata.db");
const jwt = require("jsonwebtoken");

let db = null;

{/* Validating user if exists it will generate jwt token else throws an error */}
app.get("/userdata/:username", async (request,response) => {
    const {username} = request.params 
    const getUserData = `
    SELECT *
    FROM user_details
    where name = '${username}'
    `;
    const queryResult = await db.get(getUserData)
    if (queryResult === undefined) {
        response.send("user not available")
    }
    else {
        const payLoad = {
            username: username
        }
        const jwtToken = jwt.sign(payLoad,"my_token")
        response.send(jwtToken)
    }
})

{/* Retrieve loan details*/}
app.get("/loanDetails", async(request,response) => {
    
})


const initializeTheDBAndServer = async () => {
    try {
        db = await open ({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(3002, () => {
            console.log("Server running at http://localhost:3002/")
        })
    }
    catch(e) {
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }

}


initializeTheDBAndServer()
