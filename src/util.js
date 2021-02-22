
const CreateRef = (className, objectId) => {
    return { 
        "__type": "Pointer", 
        "className": "_"+className, 
        "objectId": objectId 
    }
    // const Class = Parse.Object.extend(className)
    // let elem = new Class()
    // elem.set("objectId", objectId)
    // return elem
}

module.exports = {
    CreateRef
}