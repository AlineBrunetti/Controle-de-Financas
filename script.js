document.addEventListener("DOMContentLoaded", () => {
    carregarTransacoes();
});

async function carregarTransacoes() {
    try {
        const response = await fetch("dados.json");
        if (!response.ok) throw new Error("Erro ao carregar os dados.");
        
        const transacoes = await response.json();
        atualizarTabela(transacoes);
        atualizarGraficos(transacoes);
    } catch (error) {
        console.error("Erro ao carregar transações", error);
    }
}

async function adicionarTransacao() {
    const tipo = document.getElementById("tipo").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const setor = document.getElementById("setor").value;

    if (!valor || setor.trim() === "") {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    const novaTransacao = { tipo, valor, setor };

    try {
        const response = await fetch("salvar.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaTransacao),
        });

        if (!response.ok) throw new Error("Erro ao salvar a transação.");

        carregarTransacoes();
    } catch (error) {
        console.error("Erro ao adicionar transação", error);
    }
}

function atualizarTabela(transacoes) {
    const tbody = document.getElementById("transacoes");
    tbody.innerHTML = "";

    transacoes.forEach((t, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${t.tipo}</td>
            <td>R$ ${t.valor.toFixed(2)}</td>
            <td>${t.setor}</td>
            <td><button onclick="removerTransacao(${index})">Remover</button></td>
        `;
    });
}

async function removerTransacao(index) {
    try {
        const response = await fetch("remover.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index }),
        });

        if (!response.ok) throw new Error("Erro ao remover transação.");

        carregarTransacoes();
    } catch (error) {
        console.error("Erro ao remover transação", error);
    }
}

function atualizarGraficos(transacoes) {
    const ctxBarras = document.getElementById("graficoBarras").getContext("2d");
    const ctxPizza = document.getElementById("graficoPizza").getContext("2d");

    const setores = [...new Set(transacoes.map(t => t.setor))];
    const valores = setores.map(setor => 
        transacoes.filter(t => t.setor === setor).reduce((acc, t) => acc + t.valor, 0)
    );

    new Chart(ctxBarras, {
        type: "bar",
        data: {
            labels: setores,
            datasets: [{ label: "Gastos por setor", data: valores, backgroundColor: "blue" }]
        }
    });

    new Chart(ctxPizza, {
        type: "pie",
        data: {
            labels: setores,
            datasets: [{ data: valores, backgroundColor: ["red", "green", "blue", "orange"] }]
        }
    });
}
