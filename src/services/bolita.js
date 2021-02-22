const { GetGamblingsByDay, TransformToUserGamblings } = require('./gambling')
const { GetResultsFromApi, SaveResults, UpdateResults } = require('./apiData')
const { UserStatics, SaveStats } = require('./stats')
const { UpdateBank } = require('./bank')
const Parse = require('parse/node')

const TYPE_DAY = 'day'
const TYPE_NIGHT = 'night'

Parse.initialize("Bolita");
Parse.serverURL = 'https://parse-server-mobile-builder.herokuapp.com/bolita'


const GetLastStatus = async (day, elementFromDB) => {
    const [result, error] = await GetResultsFromApi()
    if(error){
        console.error("Schedule: cant get from API", error)
        return false
    }
    
    if (!isCurrentDay(day, result)){
        console.error("Schedule: invalid day")
        return false
    }
    const [saved, error2] = elementFromDB === null
                            ?
                            await SaveResults(result)
                            :
                            await UpdateResults(result, elementFromDB)

    if (error2) {
        console.error("Schedule: unable to save to database", error2)
        return false 
    }
    const dayType = getDayType(result)
    await ExtractStatics(day, dayType, filterDayResults(dayType, result))
    return true
}

const ExtractStatics = async (day, dayType, dayResult) => {
    const [gamblingsAll, error] = await GetGamblingsByDay(day, dayType)
    if (error){
        console.error("Unable to load gamblings", error)
        return null
    }
    const transformedGamblings = TransformToUserGamblings(gamblingsAll)

    Object.keys(transformedGamblings).map(async (key) => {
        const stats = await UserStatics(transformedGamblings[key], dayResult)
        await SaveStats(key, day, dayType, stats)
        await UpdateBank(key, stats.diff)
    })
}

const isCurrentDay = (day, result) => {
    return result.date.indexOf(day) !== -1
}

const getDayType = (apiResult) => {
    if (apiResult.pick4Evening === undefined || apiResult.pick4Evening === null){
        // Afternoon case
        return TYPE_DAY
    }
    // Night case
    return TYPE_NIGHT
}

const filterDayResults = (dayType, apiResult) => {
    if (dayType === TYPE_NIGHT) {
        return parseResult({
            pick3: apiResult.pick3Evening,
            pick4: apiResult.pick4Evening,
        })
    }
    return parseResult({
        pick3: apiResult.pick3Midday,
        pick4: apiResult.pick3Midday,
    })
}

const parseResult = (picks) => {
    const fijo = picks.pick3.substring(1)
    const corrido1 = picks.pick4.substring(0,2)
    const corrido2 = picks.pick4.substring(2)
    return {
        centena: picks.pick3.substring(0,1),
        fijo: fijo,
        corridos: [corrido1, corrido2],
        parles: [
            [fijo, corrido1],
            [corrido2, fijo],
            [corrido1, corrido2],
        ],
        candado: [fijo, corrido1, corrido2]
    }
}


module.exports = {
    GetLastStatus
}