//Diagrama de Gantt
//Controle para terminar o processo pelo nrIO
//CPU -> IO -> CPU -> IO -> ... -> CPU -> IO -> CUP
//Controle para o Round Robin

var fs = require("fs");

//Ler o arquivo de entrada
fs.readFile('entrada.json', 'utf8', function(err, data){
    if(err) throw err;
    //Parsear o arquivo
    var obj = JSON.parse(data);
    //Declaração de variáveis
    var filaQ0 = [];
    var filaQ1 = [];
    var filaIO = [];
    var processo = {};
    var countTempo = 0;
    //Colocar processos da entrada na fila
    for(processo of obj.filaQ0){
        //Colocar o processo no fim da filaQ0
        filaQ0.push(processo);
    }
    //Rodar enquanto houver pelo menos um processo em alguma das filas
    while(filaQ0||filaQ1||filaIO){
        //Verificar se existe processos na filaQ1
        if(filaQ1){
            //Verificar se existe alguma processo há muito tempo na filaQ1
            for(var i = 0; i < filaQ1.length; i++){
                //Incrementar o tempo esperando em uma unidade
                filaQ1[i].tempoEsperando++
                //Verificar se o tempo de espera na filaQ1 superou 30 ms
                if(filaQ1[i].tempoEsperando >= 30){
                    //Retirar o processo da filaQ1
                    processo = filaQ1.splice(i, 1);
                    //Zerar o tempoEsperando
                    processo.tempoEsperando = 0;
                    //Colocar o processo no fim da filaQ0
                    filaQ0.push(processo);
                }
            }
        }

        //Verificar se existe algum processo na filaIO
        if(filaIO){
            //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
            filaIO[0].tempoExecutando++; 
            //Verifica se o processo já rodou o suficiente para voltar para filaQ0 ou para filaQ1
            if(filaIO[0].tempoExecutando >= 20){
                //Retirar o processo da filaIO
                processo = filaIO.shift();
                //Zerar o tempoExecutando
                processo.tempoExecutando = 0;
                //Verificar de qual fila o processo veio
                if(processo.filaOrigem === 'filaQ0'){
                    //Colocar o processo na filaQ0
                    filaQ0.push(processo);
                }else{
                    //Colocar o processo na filaQ1
                    filaQ1.push(processo);
                }
            }
        }
        
        //Verifica se existe algum processo na filaQ0
        if(filaQ0){
            //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
            filaQ0[0].tempoExecutando++;
            //Verifica se o processo já rodou o suficiente para ir para filaIO
            if(filaQ0[0].tempoExecutando >= filaQ0[0].surtoCPU){
                //Retira o processo da filaQ0
                processo = filaQ0.shift();
                //Zera o tempoExecutando
                processo.tempoExecutando = 0;
                //Definir a fila origem como filaQ0
                processo.filaOrigem = 'filaQ0';
                //Coloca o processo na filaIO
                filaIO.push(processo);
            }//Verifica se o processo já rodou tempo suficiente no Round-Robin
            else if(filaQ0[0].tempoExecutando >= 10){
                //Retirar o processo da filaQ0
                processo = filaQ0.shift();
                //Colocar o processo na filaQ1
                filaQ1.push(processo);
            }
        }//Se filaQ0 estiver vazia, executar processo da filaQ1
        else{
            //Verificar se existe algum processo na filaQ1
            if(filaQ1){
                //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
                filaQ1[0].tempoExecutando++;
                //Verifica se o processo já rodou o suficiente para ir para filaIO
                if(filaQ1[0].tempoExecutando >= filaQ0[0].surtoCPU){
                    //Retira o processo da filaQ1
                    processo = filaQ1.shift();
                    //Zera o tempoExecutando
                    processo.tempoExecutando = 0;
                    //Definir a fila origem como filaQ1
                    processo.filaOrigem = 'filaQ1';
                    //Coloca o processo na filaIO
                    filaIO.push(processo);
                }
            }
        }
    }
});