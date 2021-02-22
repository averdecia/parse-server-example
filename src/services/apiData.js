const fetch = require("node-fetch");
const Parse = require('parse/node')

const checkUrl = "https://2ih4c7nldh.execute-api.us-west-1.amazonaws.com/prod/last"

const GetResultsFromApi = async () => {
    try{
        const response = await fetch(checkUrl)
        const json = await response.json()
        console.info("Response from external API", json)
        return [json, null]
    } catch(error){
        return [null, error]
    }
}

const SaveResults = async (info) => {
    const Class = Parse.Object.extend("NumbersResults")
    let elem = new Class()
    if (info.date)
        elem.set("day", info.date.substring(0, 10))
    if (info.pick3Midday)
        elem.set("pick3Midday", info.pick3Midday)
    if (info.pick4Midday)
        elem.set("pick4Midday", info.pick4Midday)
    if (info.pick3Evening)
        elem.set("pick3Evening", info.pick3Evening)
    if (info.pick4Evening)
        elem.set("pick4Evening", info.pick4Evening)

    try{
        const result = await elem.save()
        return [result, null]
    } catch(error){
        console.error(error)
        return [null, error]
    }
}

const UpdateResults = async (info, elem) => {
    if (info.pick3Midday)
        elem.set("pick3Midday", info.pick3Midday)
    if (info.pick4Midday)
        elem.set("pick4Midday", info.pick4Midday)
    if (info.pick3Evening)
        elem.set("pick3Evening", info.pick3Evening)
    if (info.pick4Evening)
        elem.set("pick4Evening", info.pick4Evening)

    try{
        const result = await elem.save()
        return [result, null]
    } catch(error){
        console.error("Error updating API results", error)
        return [null, error]
    }
}

const GetResultByDay = async (day) => {
    const Class = Parse.Object.extend("NumbersResults")
    const ElementQuery = new Parse.Query(Class);
    ElementQuery.equalTo("day", day)
    try{
        const results = await ElementQuery.find()
        return [results.length > 0 ? results[0] : null, null]
    } catch(error){
        return [null, error]
    }
}

module.exports = {
    GetResultsFromApi,
    SaveResults,
    UpdateResults,
    GetResultByDay
}
