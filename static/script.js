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

    if (!valor || !setor) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    if (tipo === "saida") {
        valor = -Math.abs(valor);
    }

    const transacao = { tipo, valor, setor };

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

function gerarGraficos() {
    let entrada = 0, saida = 0;
    transacoes.forEach(t => t.tipo === "entrada" ? entrada += t.valor : saida += Math.abs(t.valor));

    new Chart(document.getElementById("graficoBarras"), {
        type: 'bar',
        data: {
            labels: ['Entrada', 'Saída'],
            datasets: [{ data: [entrada, saida], backgroundColor: ['green', 'red'] }]
        }
    });

    new Chart(document.getElementById("graficoPizza"), {
        type: 'pie',
        data: {
            labels: ['Entrada', 'Saída'],
            datasets: [{ data: [entrada, saida], backgroundColor: ['green', 'red'] }]
        }
    });
}
