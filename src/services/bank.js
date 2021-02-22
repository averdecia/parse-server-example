const { CreateRef } = require('./../util')
const Entity = "Bank"

const GetUserBank = async (user_id) => {
    const Class = Parse.Object.extend(Entity)
    const ElementQuery = new Parse.Query(Class);
    ElementQuery.equalTo("user_id", CreateRef("User", user_id))
    try{
        const results = await ElementQuery.find() 
        return [results.length > 0 ? results[0] : null, null]
    } catch(error){
        return [null, error]
    }
}

const UpdateUserBank = async (bankItem, diff) => {
    bankItem.set("amount", bankItem.get("amount") + diff)
    try{
        const results = await bankItem.save() 
        return [results, null]
    } catch(error){
        return [null, error]
    }
}

const UpdateBank = async (key, diff) => {
    const [bank, error] = await GetUserBank(key)
    if (error || bank === null){
        console.error("Unable to get bank", key, diff)
        return
    }
    const [bankU, errorU] = await UpdateUserBank(bank, diff)
    if (error){
        console.error("Unable to update bank", errorU)
        return
    }
    return bankU.get("amount")
}

module.exports = {
    UpdateBank
}