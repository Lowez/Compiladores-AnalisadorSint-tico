class NaoTerminal {
    constructor(key, producao){
        this.key = key;
        this.producao = producao
    }
}

class Producao{
    constructor(naoTerminal, inicial, producao){
        this.naoTerminal = naoTerminal;
        this.inicial = inicial;
        this.producao = producao;
    }
}

const epsilon = "ε";

let iteracao = 0;
let pilha = "$S";
let entrada = "";
let finalizou = false;
let producaoGeral = [];
let sentencaDigitada = document.getElementById("sentenca");
let tabela = document.getElementById("resolucao");

$(document).ready(function(){
    // Ativa os botões dos passos ao gerar sentença
    $("#sentenca").on("input", function() {
        activateButtons();
    });
    $("#tokenGenerate").on("click", function() {
        activateButtons();
    });

    // Configurações iniciais
    reset();

    // Geração do header da tabela
    let header = $("<thead></thead>");
    let row = $("<tr></tr>").appendTo(header);

    row.append($("<th></th>").text(" "));
    row.append($("<th></th>").text("Pilha"));
    row.append($("<th></th>").text("Entrada"));
    row.append($("<th></th>").text("Ação"));

    $("#resolucao").append(header);

    // Regra S
    producaoGeral.push(
        inicializaProducao(
            "S", // Regra
            ["a"], // First
            "aAB" // Geração
        )
    );

    // Regra A
    producaoGeral.push(
        inicializaProducao(
            "A", 
            ["b"], 
            "bB"
        )
    );
    producaoGeral.push(
        inicializaProducao(
            "A", 
            ["c"], 
            "cSa"
        )
    );

    // Regra B
    producaoGeral.push(
        inicializaProducao(
            "B", 
            ["c"], 
            "cSb"
        )
    );
    producaoGeral.push(
        inicializaProducao(
            "B", 
            ["a"], 
            "aCc"
        )
    );

    // Regra C
    producaoGeral.push(
        inicializaProducao(
            "C", 
            ["a"], 
            "aA"
        )
    );
    producaoGeral.push(
        inicializaProducao(
            "C", 
            ["c"], 
            epsilon
        )
    );
});

// Organiza as regras dos Não Terminais {S, A, B, C} e seus produções nos objetos
function inicializaProducao(nTerminal, inicial, producao){
    let regraJaAdicionada = false;
    let naoTerminal;
    console.log(producaoGeral)
    for(let i in producaoGeral){
        naoTerminal = producaoGeral[i];
        regraJaAdicionada = naoTerminal.key == nTerminal;

        // Caso a regra para o Não Terminal atual esteja criada, remove da produção geral
        if(regraJaAdicionada){
            producaoGeral.splice(i, 1);
            break;
        }
    }

    // Cria a regra caso ainda não exista
    if(!regraJaAdicionada){
        naoTerminal = new NaoTerminal(nTerminal, []);
    }

    naoTerminal.producao.push(new Producao(naoTerminal, inicial, producao));
    return naoTerminal;
}

function reset(){
    iteracao = 0;
    pilha = "$S";
    entrada = "";
    finalizou = false;

    while(tabela.hasChildNodes()){
        tabela.removeChild(tabela.lastChild);
    }
}

// Gera as sentenças, substituindo não terminais por terminais
function geraSentenca(){
    let terminouDeGerar = false;
    let sentenca = "S";
    let nTerminal = "S";
    let steps = 0;

    while(!terminouDeGerar){
        for(let i in producaoGeral){
            let naoTerminal = producaoGeral[i];
            if(naoTerminal.key == nTerminal){
                let rand = Math.floor(Math.random() * naoTerminal.producao.length);
                let prod = naoTerminal.producao[rand];

                if(prod.producao !== epsilon){
                    sentenca = sentenca.replace(nTerminal, prod.producao);
                } else {
                    sentenca = sentenca.replace(nTerminal, '');
                }

                // Caso não exista mais não terminais, a sentença foi criada corretamente
                let match = /([A-Z])/g.exec(sentenca);
                
                if(match == null){
                    terminouDeGerar = true;
                } else {
                    nTerminal = match[0];
                }
            }
        }
        steps++;

        if(steps >= 10){
            sentenca = "S";
            nTerminal = "S";
            steps = 0;
        }
    }

    sentencaDigitada.value = sentenca;
    reset();

    // Geração do header da tabela
    let header = $("<thead></thead>");
    let row = $("<tr></tr>").appendTo(header);

    row.append($("<th></th>").text(" "));
    row.append($("<th></th>").text("Pilha"));
    row.append($("<th></th>").text("Entrada"));
    row.append($("<th></th>").text("Ação"));

    $("#resolucao").append(header);
}

// Busca qual deve ser a produção para o simbolo que está na pilha em relação à entrada
function buscaProximaProducao(pilha, char){
    for (let i in producaoGeral) {
        let naoTerminal = producaoGeral[i];
        if(naoTerminal.key == pilha){
            for (let j in naoTerminal.producao) {
                let producaoGeral = naoTerminal.producao[j];
                if(producaoGeral.naoTerminal.key == pilha && producaoGeral.inicial.includes(char)){
                    return producaoGeral;
                }
            }
        }
    }
    return false;
}

function passoPasso() {
    // Caso tenha sentença no campo de texto
    if(sentencaDigitada.value.length > 0){
        if(finalizou){
            reset();

            // Geração do header da tabela
            let header = $("<thead></thead>");
            let row = $("<tr></tr>").appendTo(header);

            row.append($("<th></th>").text(" "));
            row.append($("<th></th>").text("Pilha"));
            row.append($("<th></th>").text("Entrada"));
            row.append($("<th></th>").text("Ação"));

            $("#resolucao").append(header);
        }

        if(!entrada){
            entrada = sentencaDigitada.value + "$";
        }

        let acaoTomada = ""; // Aceito, Erro ou Produção
        let pilhaDeCaracteres = pilha.slice(-1); // Padrão é $S, será pego o S
        let tabelaDaPilha = pilha; // $S
        let tabelaDaEntrada = entrada; // ""
        pilha = pilha.slice(0, -1); // Retorna $

        iteracao++;

        // Caso o topo da pilha e o primeiro caractere da entrada sejam ambos $
        if(pilhaDeCaracteres == entrada.charAt(0) && pilhaDeCaracteres == "$"){
            acaoTomada = "Aceito em " + iteracao + " iterações";
            finalizou = true;

            $("#sentence").text($("#sentence").text() + " - Aceito em " + iteracao + " iterações!");
            $("#sentence").css('color', '#344d0e');
            blockButtons();
        } else if(pilhaDeCaracteres && pilhaDeCaracteres == pilhaDeCaracteres.toUpperCase()){
            // Caso o topo da pilha seja um não-terminal
            let producaoGeral = buscaProximaProducao(pilhaDeCaracteres, entrada.charAt(0));
            if(producaoGeral) {
                acaoTomada = producaoGeral.naoTerminal.key + " -> " + producaoGeral.producao;
                if(producaoGeral.producao !== epsilon){
                    pilha += producaoGeral.producao.split('').reverse().join('');
                }
            } else {
                finalizou = true;
                acaoTomada = "Erro em " + iteracao + " iterações!";

                $("#sentence").text($("#sentence").text() + " - Erro em " + iteracao + " iterações!");
                $("#sentence").css('color', 'red');
                blockButtons();
            }
        } else if (pilhaDeCaracteres && pilhaDeCaracteres == entrada.charAt(0)){
            // Caso o topo da pilha seja igual ao primeiro caractere da entrada
            acaoTomada = "Lê '" + entrada.charAt(0) + "'";
            entrada = entrada.substr(1);
        } else {
            // Caso ocorra um erro de sintaxe
            finalizou = true;
            acaoTomada = "Erro em " + iteracao + " iterações!";

            $("#sentence").text($("#sentence").text() + " - Erro em " + iteracao + " iterações!");
            $("#sentence").css('color', 'red');
            blockButtons();
        }

        // Insere a ação realizada na tabela de resolução
        inserirColuna(tabelaDaPilha, tabelaDaEntrada, acaoTomada);
        return acaoTomada;
    } else {
        finalizou = true;
    }
}

function resolucaoDireta(){
    let acaoTomada;
    reset();

    // Geração do header da tabela
    let header = $("<thead></thead>");
    let row = $("<tr></tr>").appendTo(header);

    row.append($("<th></th>").text(" "));
    row.append($("<th></th>").text("Pilha"));
    row.append($("<th></th>").text("Entrada"));
    row.append($("<th></th>").text("Ação"));

    $("#resolucao").append(header);

    while(!finalizou){
        acaoTomada = passoPasso();
    }
    alert(acaoTomada);
}

function columnHTML(type, text, cssClass){
    let cell = document.createElement(type);
    cell.className = cssClass;
    cell.innerHTML = text;
    return cell;
}

function inserirColuna(pilha, entrada, acaoTomada){
    let row = tabela.insertRow(-1);
    row.appendChild(columnHTML("td", iteracao));
    row.appendChild(columnHTML("td", pilha));
    row.appendChild(columnHTML("td", entrada));
    row.appendChild(columnHTML("td", acaoTomada));
}

function activateButtons() {
    if ($("#sentenca").val().trim() != '') {
        $("#passoPasso").prop("disabled", false);
        $("#resolucaoDireta").prop("disabled", false);
        $("#passoPasso").css('display', 'inline-block');
        $("#resolucaoDireta").css('display', 'inline-block');
        $("#passoPasso").css("opacity", "1");
        $("#resolucaoDireta").css("opacity", "1");

        $("#sentence").text($("#sentenca").val());
        $("#sentence").css('color', 'black');
    }
}

function blockButtons() {
    $("#passoPasso").prop("disabled", true);
    $("#resolucaoDireta").prop("disabled", true);
    $("#passoPasso").css("opacity", "0.5");
    $("#resolucaoDireta").css("opacity", "0.5");
}