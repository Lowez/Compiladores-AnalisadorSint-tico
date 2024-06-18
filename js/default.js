// S → ABC
// A → aAb | ε
// B → cBCcA | d
// C → eCBe | f

// First(S) = {a, c, d}    Follow(S) = {$}
// First(A) = {a, ε}       Follow(A) = {c, d, b, e, f}
// First(B) = {c, d}       Follow(B) = {e, f}
// First(C) = {e, f}       Follow(C) = {$, c, d}

// abcdfcf -> OK em 15

class NonTerminal {
    constructor(key, list){
        this.key = key;
        this.list = list
    }
}

class Production{
    constructor(nonTerminal, initial, production){
        this.nonTerminal = nonTerminal;
        this.initial = initial;
        this.production = production;
    }
}

const epsilon = "ε";

let iteracao = 0;
let pile = "$S";
let entry = "";
let end = false;
let globalProduction = [];
let palavraInput = document.getElementById("tokenInput");
let table = document.getElementById("resolutionTable");

//Inits
function initSentence(){
    let complete = false;
    let sentence = "S";
    let nTerminal = "S";
    let steps = 0;

    while(!complete){
        for(let i in globalProduction){
            let nonTerminal = globalProduction[i];
            if(nonTerminal.key == nTerminal){
                let rand = Math.floor(Math.random() * nonTerminal.list.length);
                let prod = nonTerminal.list[rand];

                if(prod.production !== epsilon){
                    sentence = sentence.replace(nTerminal, prod.production);
                } else {
                    sentence = sentence.replace(nTerminal, '');
                }

                let match = /([A-Z])/g.exec(sentence);
                
                if(match == null){
                    complete = true;
                } else {
                    nTerminal = match[0];
                }
            }
        }
        steps++;

        //Passou de 10 e nada ainda, reinicia
        if(steps >= 10){
            sentence = "S";
            nTerminal = "S";
            steps = 0;
        }
    }

    palavraInput.value = sentence;
    initAutomaton();
}

function initAutomaton(){
    clearTable();

    let header = table.createTHead();
    let row = header.insertRow(-1);

    row.appendChild(columnHTML("th", " "));
    row.appendChild(columnHTML("th", "Pilha"));
    row.appendChild(columnHTML("th", "Entrada"));
    row.appendChild(columnHTML("th", "Ação"));
}

function initProduction(nTerminal, initial, production){
    let exists = false;
    let nonTerminal;
    
    for(let i in globalProduction){
        nonTerminal = globalProduction[i];
        exists = nonTerminal.key == nTerminal;
        if(exists){
            globalProduction.splice(i, 1);
            break;
        }
    }

    if(!exists){
        nonTerminal = new NonTerminal(nTerminal, []);
    }

    nonTerminal.list.push(new Production(nonTerminal, initial, production));
    return nonTerminal;
}

//Iterar Produção
function searchProduction(pile, char){
    for (let i in globalProduction) {
        let nT = globalProduction[i];
        if(nT.key == pile){
            for (let j in nT.list) {
                let globalProduction = nT.list[j];
                console.log(globalProduction.initial);
                console.log(char);
                if(globalProduction.nonTerminal.key == pile && globalProduction.initial.includes(char)){
                    return globalProduction;
                }
            }
        }
    }
    return false;
}

function nextPass() {
    if(palavraInput.value.length > 0){
        if(end){
            initAutomaton();
        }

        if(!entry){
            entry = palavraInput.value + "$";
        }

        let action = "";
        let charPile = pile.slice(-1);
        let pileTable = pile;
        let entryTable = entry;
        pile = pile.slice(0, -1);

        iteracao++;

        if(charPile == entry.charAt(0) && charPile == "$"){
            action = "Aceito em " + iteracao + " iterações";
            end = true;
        } else if(charPile && charPile == charPile.toUpperCase()){
            let globalProduction = searchProduction(charPile, entry.charAt(0));
            if(globalProduction) {
                action = globalProduction.nonTerminal.key + " -> " + globalProduction.production;
                if(globalProduction.production !== epsilon){
                    pile += globalProduction.production.split('').reverse().join('');
                }
            } else {
                end = true;
                action = "Erro em " + iteracao + " iterações!";
            }
        } else if (charPile && charPile == entry.charAt(0)){
            action = "Lê '" + entry.charAt(0) + "'";
            entry = entry.substr(1);
        } else {
            end = true;
            action = "Erro em " + iteracao + " iterações!";
        }

        insertRow(pileTable, entryTable, action);
        return action;
    } else {
        end = true;
    }
}

function checkEnd(){
    let action;
    initAutomaton();
    while(!end){
        action = nextPass();
    }
    alert(action);
}

//Helpers
function columnHTML(type, text, cssClass){
    let cell = document.createElement(type);
    cell.className = cssClass;
    cell.innerHTML = text;
    return cell;
}

function insertRow(pile, entry, action){
    let row = table.insertRow(-1);
    row.appendChild(columnHTML("td", iteracao));
    row.appendChild(columnHTML("td", pile));
    row.appendChild(columnHTML("td", entry));
    row.appendChild(columnHTML("td", action));
}

function clearTable(){
    iteracao = 0;
    pile = "$S";
    entry = "";
    end = false;

    while(table.hasChildNodes()){
        table.removeChild(table.lastChild);
    }
}

function toggleDropdown(){
    let dropdown = document.getElementById('dropdown');
    dropdown.classList.toggle('open');
}

//Chamadas Iniciais
initAutomaton();
globalProduction.push(initProduction("S", ["a", "c", "d"], "ABC"));

globalProduction.push(initProduction("A", ["a"], "aAb"));
globalProduction.push(initProduction("A", ["b", "c", "d", "e", "f"], epsilon));

globalProduction.push(initProduction("B", ["c"], "cBCcA"));
globalProduction.push(initProduction("B", ["d"], "d"));

globalProduction.push(initProduction("C", ["e"], "eCBe"));
globalProduction.push(initProduction("C", ["f"], "f"));