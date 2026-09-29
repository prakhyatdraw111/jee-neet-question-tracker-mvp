const { randomInt } = require('crypto');
const express = require('express');

const {GoogleGenAI} = require("@google/genai");

const {readFile, writeFile} = require("fs/promises");

const {addToStudyPlanner, deleteFromPlanner, getItemsFromPlanner, getItemsFromWeak, addToWeak, deleteFromWeak, addToQuotes, getItemsFromQuotes, deleteFromQuotes, getItemsFromTracker, addDateToTracker, addContentsToTracker, clearTracker, getMsgs, addMsgs, clearMsgs} = require("../config/connectToDB.js");

const router = express.Router();

const ai = new GoogleGenAI();

router.get('/', async (req, res) => {
    const studyPlanner = await getItemsFromPlanner();

    const weakAreas = await getItemsFromWeak();

    const quotes = await getItemsFromQuotes();

    const studyTracker = await getItemsFromTracker();

    const aiMsgs = await getMsgs();

    res.render("index.ejs", {studyPlanner: studyPlanner, tracker: studyTracker, 
        weak: weakAreas, quotes: quotes, msgs: aiMsgs, messageFailed: false});

});

router.post('/', async function(req, res) {

    const { requestType, topicName, noQuestions, 
        estTime, objId, weakName, priority, 
        quote, msg, timeMin } = req.body;

    let studyPlanner = await getItemsFromPlanner();

    let weakAreas = await getItemsFromWeak();

    let quotes = await getItemsFromQuotes();

    let studyTracker = await getItemsFromTracker();

    let aiMsgs = await getMsgs();

    if (requestType === "add-to-study-planner")
    {
        studyPlanner = await addToStudyPlanner(topicName, noQuestions, estTime);
    }

    else if (requestType === "add-to-tracker")
    {
        studyPlanner = await deleteFromPlanner(objId);

        await addDateToTracker();

        studyTracker = await addContentsToTracker("planner", topicName, noQuestions, timeMin);
    }

    else if (requestType === "add-weak-to-tracker")
    {
        weakAreas = await deleteFromWeak(objId);

        await addDateToTracker();

        studyTracker = await addContentsToTracker("weak", topicName);
    }

    else if (requestType === "add-to-weak-areas")
    {
        weakAreas = await addToWeak(weakName, priority);
    }

    else if (requestType == "add-to-quotes")
    {
        quotes = await addToQuotes(quote);
    }

    else if (requestType == "remove-from-quotes")
    {
        quotes = await deleteFromQuotes(objId);
    }

    else if (requestType == "send-to-ai")
    {

        return ai.chats.create({model: "gemini-3.1-flash-lite", history: await getMsgs()})
        .sendMessage({message: `Answer the question clearly. Bolden out the formulae. Do not use latex (and dont mention u r using latex). Respond that you are not programmed to answer non-study questions, and give them jee/neet imp formulae if such questions are asked. Message: ${msg}`})
        .then((resp) => {

            console.log("finished");  
            
            addMsgs(msg, resp.text).then((msgs) => {

                aiMsgs = msgs;

                res.render("index.ejs", {studyPlanner: studyPlanner, tracker: studyTracker, 
                    weak: weakAreas, quotes: quotes, msgs: aiMsgs, messageFailed: false});
            });        

        }).catch((error) => {

            console.log(error);

            res.render("index.ejs", {studyPlanner: studyPlanner, tracker: studyTracker, 
            weak: weakAreas, quotes: quotes, msgs: aiMsgs, messageFailed: true});
        });
    }

    else if (requestType == "clear-chat")
    {
        aiMsgs = await clearMsgs();
    }

    else if (requestType == "clear-tracker")
    {
        studyTracker = await clearTracker();
    }

    res.render("index.ejs", {studyPlanner: studyPlanner, tracker: studyTracker, 
        weak: weakAreas, quotes: quotes, msgs: aiMsgs, messageFailed: false});

});

router.get("/about", (req, res) => {

    res.render("about.ejs");
    
});

router.get("/send-feedback", (req, res) => {

    return res.redirect("https://docs.google.com/forms/d/e/1FAIpQLSdsbxhhxPSr3iGRTPKUiQbeikx9FlxUWJWNQoDEWe5yduptow/viewform?usp=publish-editor");
});

module.exports = router;
