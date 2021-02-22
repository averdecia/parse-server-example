const Parse = require('parse/node')
const Entity = "Gamblings"


const GetGamblingsByDay =  async (day, dayType) => {
    const Class = Parse.Object.extend(Entity)
    const ElementQuery = new Parse.Query(Class);
    ElementQuery.equalTo("day", day)
    ElementQuery.equalTo("dayType", dayType)
    try{
        const results = await ElementQuery.find() 
        return [results, null]
    } catch(error){
        return [null, error]
    }
}

const TransformToUserGamblings = (gamblings) => {
    let result = {}
    gamblings.map((elem) => {
        if(result[elem.get("user_id").id] === undefined){
            result[elem.get("user_id").id] = []
        }
        result[elem.get("user_id").id].push(elem)
    })
    return result
}


module.exports = {
    GetGamblingsByDay,
    TransformToUserGamblings
}