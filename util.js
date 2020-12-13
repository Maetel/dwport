//util.js
function log(content){
    console.log(content)
}

function sortDict(dict, byKey=true, ascending=true){
    if(byKey){
        let keyArray = Object.keys(dict)
        if(ascending){
            keyArray.sort()
        }
        else {
            keyArray.sort(function(a, b){return b-a});
        }
        let valueArray = []
        keyArray.forEach(key => valueArray.push(dict[key]))
        return [keyArray, valueArray]
    }
    
    /// by value
    let valueArray = Object.values(dict)
    if(ascending){
        valueArray.sort()
    }
    else {
        valueArray.sort(function(a, b){return b-a});
    }
    valueArray = []
    keyArray.forEach(key=>valueArray.push(dict[key]))
    return [keyArray, valueArray]
}

function containsOnlyNumber(val){
    return /^\d+$/.test(val)
}

function intListLookup(dest, intList)
{
    let result = -1;

    //sort asc
    let copied = [...intList]
    copied.sort();

    copied.forEach(elem => {
        if (dest <= elem)
        {
            return elem;
        }
    })

    return result;
}

