const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: 'mysql-jee-neet-q-tracker.h.aivencloud.com',
  port: 24321,
  user: 'avnadmin',   
  password: process.env.DB_PASSWORD, 
  database: 'defaultdb',
  waitForConnections: true,
  connectTimeout: 20000, // Time in milliseconds (20 seconds)
  queueLimit: 0
});

async function getItemsFromPlanner()
{
    try
    {
        const [result] = await pool.execute("SELECT * FROM studyTracker");

        console.log("contents in study planner: ", result);

        return result;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function addToStudyPlanner(topic, questions, time)
{
    try
    {
        const query = "INSERT INTO studyTracker (topic, noQuestions, timeMin) VALUES (?, ?, ?)";

        const [result] = await pool.execute(query, [topic, questions, time]);

        console.log("added to tracker: ", result.id);

        const contents = await getItemsFromPlanner();

        console.log("update: ", contents);

        return contents;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function deleteFromPlanner(planID)
{
    try
    {
        const query = "DELETE FROM studyTracker WHERE id=?";

        const [result] = await pool.execute(query, [planID]);

        const contents = await getItemsFromPlanner();

        console.log("update: ", contents);

        return contents;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function getItemsFromWeak()
{
    try
    {
        const [result] = await pool.execute("SELECT * FROM weakAreas");

        console.log("contents in weak areas: ", result);

        return result;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function addToWeak(topicName, priority)
{
    try
    {
        const query = "INSERT INTO weakAreas (weakArea, priority) VALUES (?, ?)";

        const [result] = await pool.execute(query, [topicName, priority]);

        const contents = await getItemsFromWeak();

        console.log("update in weak areas: ", contents);

        return contents;
    }
    catch (error)
    {
        console.log("error", error);
    }
}


async function deleteFromWeak(objID)
{
    try
    {
        const query = "DELETE FROM weakAreas WHERE id = ?";

        const [result] = await pool.execute(query, [objID]);

        const contents = await getItemsFromWeak();

        console.log("update in weak areas: ", contents);

        return contents;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function getItemsFromQuotes()
{
    try
    {
        const [result] = await pool.execute("SELECT * FROM motivationalQuotes");

        console.log("contents in quotes: ", result);

        return result;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function addToQuotes(quote)
{
    try
    {
        const query = "INSERT INTO motivationalQuotes (quote) VALUES (?)";

        const [result] = await pool.execute(query, [quote]);

        const contents = await getItemsFromQuotes();

        console.log("update in quotes: ", contents);

        return contents;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function deleteFromQuotes(objID)
{
    try
    {
        const query = "DELETE FROM motivationalQuotes WHERE id = ?";

        const [result] = await pool.execute(query, [objID]);

        const contents = await getItemsFromQuotes();

        console.log("update in weak areas: ", contents);

        return contents;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function getItemsFromTracker()
{
    try
    {
        const [result] = await pool.execute("SELECT * FROM tracker");

        console.log("contents in tracker: ", result);

        return result;
    }
    catch (error)
    {
        console.log("error", error);
    }
}

async function addDateToTracker()
{
    try
    {
        const todaysDate = new Date().toISOString().slice(0, 10);

        console.log(`study tracker current date: ${todaysDate}`);

        const query = 'SELECT * FROM tracker where date=?';

        const [result] = await pool.execute(query, [todaysDate]);

        if (result.length == 0)
        {
            console.log("study tracker: no date for today, must add");

            const query = 'INSERT INTO tracker (date, contents) values (?, ?)';

            const [result] = await pool.execute(query, [todaysDate, "[]"]);
        }

        else
        {
            console.log("study tracker date is there");
        }
    }
    catch (error)
    {
        console.log("studyTracker error: ", error);
    }
}

async function addContentsToTracker(type, topicName, noQuestions=0, timeTaken=0)
{
    try
    {
        const dateQuery = "SELECT * FROM tracker WHERE date=?";

        const [dateResult] = await pool.execute(dateQuery, [new Date().toISOString().slice(0, 10)]);
        
        let contents = JSON.parse(dateResult[0]["contents"]);

        console.log("study tracker: initial date result: ", contents);

        contents.push({type: type, topicName: topicName, noQuestions: noQuestions, timeTaken: timeTaken});

        const addQuery = "UPDATE tracker SET contents=? WHERE id=?";

        const [addResult] = await pool.execute(addQuery, [JSON.stringify(contents), dateResult[0]["id"]]);

        console.log("study tracker: final result: \n", contents);

        const res = await getItemsFromTracker();

        return res;
    }
    catch (error)
    {
        console.log("studyTracker error: ", error);
    }
}

async function clearTracker()
{
    try
    {
        const [res] = await pool.execute("TRUNCATE TABLE tracker");

        const result = await getItemsFromTracker();

        return result;
    }
    catch (error)
    {
        console.log("studyTracker clear tracker error: ", error);
    }
}

async function getMsgs()
{
    try
    {
        const query = "SELECT * FROM aiMsgs";

        const [rawResult] = await pool.execute(query);

        let result = [];

        rawResult.forEach((item) => {
            result.push({"role": item["role"], "parts": JSON.parse(item["parts"])});
        });

        console.log("aiMsgs contents:", result);

        return result;
    }
    catch (error)
    {
        console.log("aimsgs error: ", error);
    }
}

async function clearMsgs()
{
    try
    {
        const [result] = await pool.execute("TRUNCATE TABLE aiMsgs");

        return [];
    }
    catch (error)
    {
        console.log("aimsgs error: ", error);
    }
}

async function addMsgs(userMsg, aiMsg)
{
    try
    {
        const query = "INSERT INTO aiMsgs (role, parts) VALUES (?, ?)";

        const [userResult] = await pool.execute(query, ["user", JSON.stringify([{text: userMsg}])]);

        const [aiResult] = await pool.execute(query, ["model", JSON.stringify([{text: aiMsg}])]);

        const result = getMsgs();

        return result;
    }
    catch (error)
    {
        console.log("aimsgs error: ", error);
    }
}

module.exports = {
    addToStudyPlanner, deleteFromPlanner, getItemsFromPlanner,
    getItemsFromWeak, addToWeak, deleteFromWeak,
    addToQuotes, getItemsFromQuotes, deleteFromQuotes,
    getItemsFromTracker, addDateToTracker, addContentsToTracker,
    clearTracker, addMsgs, clearMsgs, getMsgs
};