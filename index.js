//Diagrama de Gantt
//CPU -> IO -> CPU -> IO -> ... -> CPU -> IO -> CUP

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
    var filaFinalizado = [];
    var processo = {};
    var countTempo = 0;
    //Colocar processos da entrada na fila
    for(processo of obj.filaQ0){
        //Inicializar atributos que serão usado
        processo.tempoEsperando = 0;
        processo.tempoExecutando = 0;
        processo.tempoFinal = 0;
        processo.tempoRR = 0;
        processo.filaOrigem = '';
        //Colocar o processo no fim da filaQ0
        filaQ0.push(processo);
    }
    //Rodar enquanto houver pelo menos um processo em alguma das filas
    while(filaQ0.length > 0|| filaQ1.length > 0|| filaIO.length > 0){
        //Incrementar o tempo geral
        countTempo++;
        //Verificar se existe processos na filaQ1
        if(filaQ1.length > 0){
            //Verificar se existe algum processo há muito tempo na filaQ1
            for(var i = 0; i < filaQ1.length; i++){
                //Incrementar o tempo esperando em uma unidade
                filaQ1[i].tempoEsperando++
                console.log(countTempo+ " Processo:"+filaQ1[i].id+" tempo esperando: "+filaQ1[i].tempoEsperando);
                //Verificar se o tempo de espera na filaQ1 superou 30 ms
                if(filaQ1[i].tempoEsperando >= 30){
                    //Retirar o processo da filaQ1
                    processo = filaQ1.splice(i, 1)[0];
                    i--;
                    console.log(countTempo+" Processo:"+processo.id+" foi para filaQ0 depois de "+processo.tempoEsperando);
                    //Zerar o tempoEsperando
                    processo.tempoEsperando = 0;
                    //Colocar o processo no fim da filaQ0
                    filaQ0.push(processo);
                }
            }
        }

        //Verificar se existe algum processo na filaIO
        if(filaIO.length > 0){
            //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
            filaIO[0].tempoExecutando++;
            console.log(countTempo+" Processo:"+filaIO[0].id+" executando em IO "+filaIO[0].tempoExecutando); 
            //Verifica se o processo já rodou o suficiente para voltar para filaQ0 ou para filaQ1
            if(filaIO[0].tempoExecutando >= 20){
                //Retirar o processo da filaIO
                processo = filaIO.shift();
                //Reduzir o número de operações de entrada e saída
                processo.nrIO--;
                //Zerar o tempoExecutando
                console.log(countTempo+" Processo:"+processo.id+" executou "+processo.tempoExecutando+" e voltara para "+processo.filaOrigem+" faltando nrIO "+processo.nrIO);
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
        if(filaQ0.length > 0){
            //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
            filaQ0[0].tempoExecutando++;
            //Incrementar o tempo executando RR em 1 unidade
            filaQ0[0].tempoRR++;
            console.log(countTempo+" Processo:"+filaQ0[0].id+" Q0 execução total "+filaQ0[0].tempoExecutando+" RR "+filaQ0[0].tempoRR);
            //Verifica se o processo já rodou o suficiente para ir para filaIO
            if(filaQ0[0].tempoExecutando >= filaQ0[0].surtoCPU){
                //Retira o processo da filaQ0
                processo = filaQ0.shift();
                //Zera o tempoExecutando
                processo.tempoExecutando = 0;
                //Zera o tempoRR
                processo.tempoRR = 0;
                //Definir a fila origem como filaQ0
                processo.filaOrigem = 'filaQ0';
                //Verificar se ainda existem operações de IO
                if(processo.nrIO > 0){
                    //Coloca o processo na filaIO
                    console.log(countTempo+" Processo:"+processo.id+" foi para IO depois de Q0 com nrIO "+processo.nrIO);
                    filaIO.push(processo);
                }//Caso não existam operações, processo terminou sua execução
                else{
                    processo.tempoFinal = countTempo;
                    console.log(countTempo+" Processo:"+processo.id+" finalizado em "+processo.tempoFinal);
                    filaFinalizado.push(processo);
                }
            }//Verifica se o processo já rodou tempo suficiente no Round-Robin
            else if(filaQ0[0].tempoRR >= 10){
                //Retirar o processo da filaQ0
                processo = filaQ0.shift();
                console.log(countTempo+" Processo:"+processo.id+" foi para Q1 depois de execução total "+processo.tempoExecutando+" RR "+processo.tempoRR);
                //Zerar o tempoRR
                processo.tempoRR = 0;
                //Colocar o processo na filaQ1
                filaQ1.push(processo);
            }
        }//Se filaQ0 estiver vazia, executar processo da filaQ1
        else{
            //Verificar se existe algum processo na filaQ1
            if(filaQ1.length){
                //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
                filaQ1[0].tempoExecutando++;
                console.log(countTempo+" Processo:"+filaQ1[0].id+" Q1 execução total "+filaQ1[0].tempoExecutando);
                //Verifica se o processo já rodou o suficiente para ir para filaIO
                if(filaQ1[0].tempoExecutando >= filaQ1[0].surtoCPU){
                    //Retira o processo da filaQ1
                    processo = filaQ1.shift();
                    //Zera o tempoExecutando
                    processo.tempoExecutando = 0;
                    //Zera o tempoEsperando
                    processo.tempoEsperando = 0;
                    //Definir a fila origem como filaQ1
                    processo.filaOrigem = 'filaQ1';
                    //Verificar se ainda existem operações de IO
                    if(processo.nrIO > 0){
                        //Coloca o processo na filaIO
                        filaIO.push(processo);
                        console.log(countTempo+" Processo:"+processo.id+" foi para IO depois de Q0 com nrIO "+processo.nrIO);
                    }//Caso não existam operações, processo terminou sua execução
                    else{
                        processo.tempoFinal = countTempo;
                        console.log(countTempo+" Processo:"+processo.id+" finalizado em "+processo.tempoFinal);
                        filaFinalizado.push(processo);
                    }
                }
            }
        }
    }
});