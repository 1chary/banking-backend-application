const express = require("express");
const app = express();
const path = require("path");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname,"userdata.db");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());

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
        response.send({jwtToken})
    }
})

{/* Retrieve loan details*/}
app.get("/loanDetails/:name", async(request,response) => {
    const {name} = request.params;
    const getTheUserLoanDetails = `
    SELECT *
    FROM user_details left join loan_details on user_details.user_id = loan_details.user_id
    WHERE name = '${name}'
    `;
    const runQuery = await db.get(getTheUserLoanDetails)
    if (runQuery === undefined) {
        response.send("Either loan not available or user not available")
    }
    else {
        const checkUserIsAvailable = `
        select *
        from loan_of_specific_user
        where user_id = ${runQuery.user_id}
        `;
        const userAvailability = await db.get(checkUserIsAvailable);
        if (userAvailability !== undefined) {
            const loanAmount = runQuery.amount;
            const tenure = runQuery.tenure_in_months;
            const monthlyAmountToPay = loanAmount / tenure;
            for (let i = 0; i < tenure; i ++) {
                const insertData = `
                    insert into loan_of_specific_user(user_id,repayment_amount,repayment_status)
                    values (${runQuery.user_id},${monthlyAmountToPay},"Paid")
                `;
                db.run(insertData)
            }
            response.send("data updated successfully")
        }
        else {
            response.send("user exists in records")
        }
        
    }
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
