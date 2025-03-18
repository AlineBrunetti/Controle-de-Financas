let transacoes = [];

document.addEventListener("DOMContentLoaded", function () {
    carregarTransacoes();
});

async function carregarTransacoes() {
    try {
        const resposta = await fetch("http://127.0.0.1:5000/transacoes");
        transacoes = await resposta.json();

        atualizarTabela();
        gerarGraficos();
    } catch (error) {
        console.error("Erro ao carregar transações", error);
    }
}

async function adicionarTransacao() {
    const tipo = document.getElementById("tipo").value;
    let valor = parseFloat(document.getElementById("valor").value);
    const setor = document.getElementById("setor").value;
    const mes = document.getElementById("mes").value;  // Pega o mês

    if (!valor || !setor || !mes) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    // Se for uma saída, transforma o valor em negativo
    if (tipo === "saida") {
        valor = -Math.abs(valor);
    }

    const transacao = { tipo, valor, setor, mes };  // Envia o mês também

    try {
        await fetch("http://127.0.0.1:5000/transacoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transacao)
        });
        
        carregarTransacoes();
    } catch (error) {
        console.error("Erro ao adicionar transação", error);
    }
}


function atualizarTabela() {
    const tbody = document.getElementById("transacoes");
    tbody.innerHTML = "";
    transacoes.forEach(transacao => {
        const row = `<tr>
                        <td>${transacao.tipo}</td>
                        <td>R$ ${transacao.valor.toFixed(2)}</td>
                        <td>${transacao.setor}</td>
                        <td><button onclick="excluirTransacao(${transacao.id})">Excluir</button></td>
                     </tr>`;
        tbody.innerHTML += row;
    });
}

async function excluirTransacao(id) {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
        try {
            await fetch(`http://127.0.0.1:5000/transacoes/${id}`, { method: "DELETE" });
            carregarTransacoes();
        } catch (error) {
            console.error("Erro ao excluir transação:", error);
        }
    }
}

function gerarGrafico() {
    if (!transacoes.length) {
        console.log("Nenhuma transação disponível para gerar o gráfico.");
        return;
    }

    let entradasPorMes = {};
    let saidasPorMes = {};

    transacoes.forEach(transacao => {
        const mes = transacao.mes; // Mês
        if (transacao.tipo === "entrada") {
            entradasPorMes[mes] = (entradasPorMes[mes] || 0) + transacao.valor;
        } else if (transacao.tipo === "saida") {
            saidasPorMes[mes] = (saidasPorMes[mes] || 0) + Math.abs(transacao.valor); // Valor absoluto para saídas
        }
    });

    // Gerar gráfico de barras (entrada vs saída)
    const ctxBarras = document.getElementById("graficoBarras").getContext("2d");
    const meses = Object.keys(entradasPorMes);
    const entradas = meses.map(mes => entradasPorMes[mes]);
    const saidas = meses.map(mes => saidasPorMes[mes]);

    // Verifica se o gráfico já existe antes de tentar destruí-lo
    if (window.graficoBarras instanceof Chart) {
        window.graficoBarras.destroy();
    }

    window.graficoBarras = new Chart(ctxBarras, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Entradas',
                data: entradas,
                backgroundColor: '#4CAF50',
                borderColor: '#388E3C',
                borderWidth: 1
            },
            {
                label: 'Saídas',
                data: saidas,
                backgroundColor: '#F44336',
                borderColor: '#D32F2F',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gerar gráfico de pizza
    const ctxPizza = document.getElementById("graficoPizza").getContext("2d");
    const totalEntradas = entradas.reduce((acc, val) => acc + val, 0);
    const totalSaidas = saidas.reduce((acc, val) => acc + val, 0);

    if (window.graficoPizza instanceof Chart) {
        window.graficoPizza.destroy();
    }

    window.graficoPizza = new Chart(ctxPizza, {
        type: 'pie',
        data: {
            labels: ['Entradas', 'Saídas'],
            datasets: [{
                data: [totalEntradas, totalSaidas],
                backgroundColor: ['#4CAF50', '#F44336'],
                hoverBackgroundColor: ['#388E3C', '#D32F2F']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

