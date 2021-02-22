const Parse = require('parse/node')
const { CreateRef } = require('./../util')
const Entity = "Stats"

const F_FIJO = n => n * 70
const F_CORRIDO = n => n * 25
const F_CENTENA = n => n * 500
const F_PARLE = n => n * 750


const SaveStats = async (user_id, day, dayType, stats) => {
    const Class = Parse.Object.extend(Entity)
    let elem = new Class()
    elem.set("day", day)
    elem.set("dayType", dayType)
    elem.set("user_id", CreateRef("User", user_id))
    elem.set("entries", stats.entries)
    elem.set("looses", stats.looses)
    elem.set("userEarnings", stats.userEarnings)
    elem.set("diff", stats.diff)

    try{
        const result = await elem.save()
        return [result, null]
    } catch(error){
        console.error(error)
        return [null, error]
    }
}

const UserStatics = async (gamblings, apiResult) => {
    let entries = 0
    let loosesAll = 0
    gamblings.map(async (elem) => {
        entries += elem.get("amount") + elem.get("corridoAmount") + elem.get("centenaAmount")
        let looses = 0
        if (elem.get("type") === "fijo" && elem.get("value") === apiResult.fijo) {
            looses += F_FIJO(elem.get("amount"))
        } 
        if (matchCorrido(elem, apiResult)){
            looses += F_CORRIDO(elem.get("corridoAmount"))
        } 
        if (matchCentena(elem, apiResult)){
            looses += F_CENTENA(elem.get("centenaAmount"))
        } 
        if(matchParle(elem, apiResult.parles)){
            looses += F_PARLE(elem.get("amount"))
        } 
        if (looses === 0) {
            return
        }
        try {
            loosesAll += looses
            elem.set("win", true)
            await elem.save()
        } catch (error){
            console.error("Error saving winning", error)
        }
    })

    return {
        entries: entries,
        looses: loosesAll,
        userEarnings: Math.floor(entries * 0.2),
        diff: entries - Math.floor(entries * 0.2) - loosesAll
    }
}

const matchCorrido = (elem, apiResult) => {
    return elem.get("type") === "fijo" 
            && elem.get("corridoAmount") !== 0 
            && apiResult.corridos.indexOf(elem.get("value")) !== -1
}

const matchCentena = (elem, apiResult) => {
    return elem.get("type") === "fijo" 
            && elem.get("centenaAmount") !== 0 
            && apiResult.centena === elem.get("centenaValue") 
            && apiResult.fijo === elem.get("value")
}

const matchParle = (elem, parles) => {
    if (elem.get("type") !== "parle" ){
        return false
    } 
    const [number1, number2] = elem.get("value").split(',')
    const filter = parles.filter((e) => {
        return e.indexOf(number1) !== -1 && e.indexOf(number2) !== -1
    })
    return filter.length > 0
}

const matchCandado = (value, candado) => {
    const [number1, number2, number3] = value.split(',')

    return candado.indexOf(number1) !== -1 &&
        candado.indexOf(number2) !== -1 &&
        candado.indexOf(number3) !== -1 
}

module.exports = {
    SaveStats,
    UserStatics
}