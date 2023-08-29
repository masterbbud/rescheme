    
const PROPERTY_NAMES = ['color', 'background-color', 'outline-color', 'border-color']
// IS a reference. Must be copied into injected functions getColors() and updateColorsOnPage().

function parseColor(input) {
    if (input.substr(0,1)=="#") {
    var collen=(input.length-1)/3;
    var fact=[17,1,0.062272][collen-1];
    return [
        Math.round(parseInt(input.substr(1,collen),16)*fact),
        Math.round(parseInt(input.substr(1+collen,collen),16)*fact),
        Math.round(parseInt(input.substr(1+2*collen,collen),16)*fact)
    ];
    }
    else return input.split("(")[1].split(")")[0].split(",").map(x=>+x);
}

async function getTabId() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
  }
function getColors() {
    
    
    const PROPERTY_NAMES = ['color', 'background-color', 'outline-color', 'border-color']
    
    var elements = document.getElementsByTagName('*');

function convertColorToArray(input) {
    if (input.substr(0,1)=="#") {
        var collen=(input.length-1)/3;
        var fact=[17,1,0.062272][collen-1];
        return [
            Math.round(parseInt(input.substr(1,collen),16)*fact),
            Math.round(parseInt(input.substr(1+collen,collen),16)*fact),
            Math.round(parseInt(input.substr(1+2*collen,collen),16)*fact)
        ]
        }
        else return input.split("(")[1].split(")")[0].split(",").map(x=>+x);
}

const counts = {}

for (el of elements) {
    // should use a dict not set to count occurences
    for (prop of PROPERTY_NAMES) {
        let input = window.getComputedStyle(el).getPropertyValue(prop);
        let array = JSON.stringify(convertColorToArray(input));
        if (!counts[array]) {
            counts[array] = 1;
        }
        else {
            counts[array] += 1;
        }
    }
}
var items = Object.keys(counts).map(function(key) {
    return [key, counts[key]];
  });
  
  items.sort(function(first, second) {
    return second[1] - first[1];
  });
console.log(items)
return items;
 }

function setupColors(colors) {
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
    
    const rgbToHex = (r, g, b) => {
        console.log(r, g, b)
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    let listObj = document.getElementById('colorsList');
    let i = 1;
    for (let colorPair of colors) {
        let color = JSON.parse(colorPair[0])
        CURRENT_MAP[i] = [color, color];
        let div = document.createElement('div');
        let hexValue = rgbToHex(color[0], color[1], color[2])
        div.innerHTML = `
        <div id="color-value-${i}-original" style="background-color: ${hexValue}"></div>
        <input type="color" id="color-option-${i}-new" value="${hexValue}"/>`
        div.classList.add('colorRow')
        listObj.appendChild(div)
        document.getElementById(`color-option-${i}-new`).onchange = (function(index) {
            return function() {
                CURRENT_MAP[index][1] = document.getElementById(`color-option-${index}-new`).value;
            }
        } )(i);
        i += 1;
    }
}

function updateInputValue(val) {
    console.log(val);
}

CURRENT_MAP = []

async function sendMessage() {
    const tabId = await getTabId()
    chrome.scripting
        .executeScript({
          target : {tabId : tabId},
          func : getColors,
        })
        .then(res => setupColors(res[0].result));
}

sendMessage();

function updateColorsOnPage(mapString) {

    const PROPERTY_NAMES = ['color', 'background-color', 'outline-color', 'border-color']

    function convertColorToArray(input) {
        if (input.substr(0,1)=="#") {
            var collen=(input.length-1)/3;
            var fact=[17,1,0.062272][collen-1];
            return [
                Math.round(parseInt(input.substr(1,collen),16)*fact),
                Math.round(parseInt(input.substr(1+collen,collen),16)*fact),
                Math.round(parseInt(input.substr(1+2*collen,collen),16)*fact)
            ]
            }
            else return input.split("(")[1].split(")")[0].split(",").map(x=>+x);
    }
    const map = JSON.parse(mapString);
    console.log(map);
    var elements = document.getElementsByTagName('*');
    for (el of elements) {
        for (prop of PROPERTY_NAMES) {
            let input = window.getComputedStyle(el).getPropertyValue(prop);
            let array = convertColorToArray(input);
            console.log(array);
            if (map[array]) {
                el.style.color = map[array];
            }
        }
    }
}

async function updateColors() {
    const tabId = await getTabId()
    let dict_map = {}
    for (val in CURRENT_MAP) {
        dict_map[CURRENT_MAP[val][0]] = CURRENT_MAP[val][1];
    }

    chrome.scripting
        .executeScript({
          target : {tabId : tabId},
          func : updateColorsOnPage,
          args : [JSON.stringify(dict_map)]
        })
}

document.getElementById('updateColors').onclick = updateColors;