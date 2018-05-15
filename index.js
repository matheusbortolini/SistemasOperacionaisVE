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
    var filaTransicao = [];
    var processo = {};
    var countTempo = 0;
    //Colocar processos da entrada na fila
    for(processo of obj.filaQ0){
        //Inicializar atributos que serão usado
        processo.tempoEsperando = 0;
        processo.tempoExecutando = 0;
        processo.tempoFinal = 0;
        processo.tempoRR = 0;
        processo.filaDestino = '';
        //Colocar o processo no fim da filaQ0
        filaQ0.push(processo);
    }
    //Rodar enquanto houver pelo menos um processo em alguma das filas
    while(filaQ0.length > 0|| filaQ1.length > 0|| filaIO.length > 0 || filaTransicao.length > 0){
        //Incrementar o tempo geral
        countTempo++;
        //Verificar se existem processos na filaTransicao
        if(filaTransicao.length > 0){
            for(var i = 0; i < filaTransicao.length; i++){
                //Retirar o processo da fila de transição
                processo = filaTransicao.splice(i, 1)[0];
                i--;
                console.log("Tempo:"+countTempo+" Processo "+processo.id+" foi para fila "+processo.filaDestino);
                //Verificar qual a fila destino
                if(processo.filaDestino === 'filaQ0'){
                    //Colocar o processo no fim da filaQ0
                    filaQ0.push(processo)
                }else if(processo.filaDestino === 'filaQ1'){
                    //Colocar o processo no fim da filaQ1
                    filaQ1.push(processo);
                }else{
                    //Colocar o processo no fim da filaIO
                    filaIO.push(processo);
                }
            }
        } 
        //Verificar se existem processos na filaQ1
        if(filaQ1.length > 0){
            //Verificar se existe algum processo há muito tempo na filaQ1
            for(var i = 0; i < filaQ1.length; i++){
                //Incrementar o tempo esperando em uma unidade
                filaQ1[i].tempoEsperando++
                //Verificar se o tempo de espera na filaQ1 superou 30 ms
                if(filaQ1[i].tempoEsperando >= 30){
                    //Retirar o processo da filaQ1
                    processo = filaQ1.splice(i, 1)[0];
                    i--;
                    console.log("Tempo:"+countTempo+" Processo "+processo.id+" foi para filaTransicao depois de "+processo.tempoEsperando+" na filaQ1");
                    //Zerar o tempoEsperando
                    processo.tempoEsperando = 0;
                    //Definir fila destino
                    processo.filaDestino = 'filaQ0';
                    //Colocar o processo na fila de transição
                    filaTransicao.push(processo);
                }
            }
        }

        //Verificar se existe algum processo na filaIO
        if(filaIO.length > 0){
            //Informar que o processo está executando
            console.log("Tempo:"+countTempo+" Processo "+filaIO[0].id+" executando em filaIO");
            //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
            filaIO[0].tempoExecutando++;
            //Verifica se o processo já rodou o suficiente para voltar para filaQ0
            if(filaIO[0].tempoExecutando >= 20){
                //Retirar o processo da filaIO
                processo = filaIO.shift();
                //Reduzir o número de operações de entrada e saída
                processo.nrIO--;
                //Zerar o tempoExecutando
                console.log("Tempo:"+countTempo+" Processo "+processo.id+" executou em IO por "+processo.tempoExecutando+" e irá para fila de transição faltando "+processo.nrIO+" operações de IO");
                processo.tempoExecutando = 0;
                //Definir fila destino
                processo.filaDestino = 'filaQ0';
                //Colocar o processo na fila de transição
                filaTransicao.push(processo);
            }
        }
        
        //Verifica se existe algum processo na filaQ0
        if(filaQ0.length > 0){
            //Informar que o processo começou a execução
            console.log("Tempo:"+countTempo+" Processo "+filaQ0[0].id+" executando em filaQ0");
            //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
            filaQ0[0].tempoExecutando++;
            //Incrementar o tempo executando RR em 1 unidade
            filaQ0[0].tempoRR++;
            //Verifica se o processo já rodou o suficiente para ir para filaIO
            if(filaQ0[0].tempoExecutando >= filaQ0[0].surtoCPU){
                //Retira o processo da filaQ0
                processo = filaQ0.shift();
                //Zera o tempoExecutando
                processo.tempoExecutando = 0;
                //Zera o tempoRR
                processo.tempoRR = 0;
                //Verificar se ainda existem operações de IO
                if(processo.nrIO > 0){
                    //Coloca o processo na filaIO
                    console.log("Tempo:"+countTempo+" Processo "+processo.id+" foi para fila de transição depois de Q0");
                    //Definir fila destino
                    processo.filaDestino = 'filaIO';
                    //Colocar o processo na fila de transição
                    filaTransicao.push(processo);
                }//Caso não existam operações, processo terminou sua execução
                else{
                    processo.tempoFinal = countTempo;
                    console.log("Tempo:"+countTempo+" Processo "+processo.id+" finalizado em "+processo.tempoFinal);
                }
            }//Verifica se o processo já rodou tempo suficiente no Round-Robin
            else if(filaQ0[0].tempoRR >= 10){
                //Retirar o processo da filaQ0
                processo = filaQ0.shift();
                console.log("Tempo:"+countTempo+" Processo "+processo.id+" foi para fila de transição por preempção de tempo depois de execução total "+processo.tempoExecutando);
                //Zerar o tempoRR
                processo.tempoRR = 0;
                //Definir fila destino
                processo.filaDestino = 'filaQ1';
                //Colocar o processo na fila de transição
                filaTransicao.push(processo);
            }
        }//Se filaQ0 estiver vazia, executar processo da filaQ1
        else{
            //Verificar se existe algum processo na filaQ1
            if(filaQ1.length){
                //Informar que o processo começou a execução
                console.log("Tempo:"+countTempo+" Processo "+filaQ1[0].id+" executando em filaQ1");
                //Rodar o primeiro processo por 1 ms (menor unidade de tempo)
                filaQ1[0].tempoExecutando++;
                //Zerar o tempo que este processo estava esperando
                filaQ1[0].tempoEsperando = 0;
                //Verifica se o processo já rodou o suficiente para ir para filaIO
                if(filaQ1[0].tempoExecutando >= filaQ1[0].surtoCPU){
                    //Retira o processo da filaQ1
                    processo = filaQ1.shift();
                    //Zera o tempoExecutando
                    processo.tempoExecutando = 0;
                    //Verificar se ainda existem operações de IO
                    if(processo.nrIO > 0){
                        //Coloca o processo na filaIO
                        console.log("Tempo:"+countTempo+" Processo "+processo.id+" foi para fila de transição depois de Q1");
                        //Definir fila destino
                        processo.filaDestino = 'filaIO';
                        //Colocar o processo na fila de transição
                        filaTransicao.push(processo);
                    }//Caso não existam operações, processo terminou sua execução
                    else{
                        processo.tempoFinal = countTempo;
                        console.log("Tempo:"+countTempo+" Processo "+processo.id+" finalizado em "+processo.tempoFinal);
                    }
                }
            }
        }
    }
});