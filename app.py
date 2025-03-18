from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__)

# Caminho do arquivo Excel que será usado como "banco de dados"
EXCEL_FILE = "database.xlsx"

# Se o arquivo não existir, cria um novo
if not os.path.exists(EXCEL_FILE):
    df = pd.DataFrame(columns=["id", "tipo", "valor", "setor", "mes"])
    df.to_excel(EXCEL_FILE, index=False)

# Página inicial - Carrega o HTML
@app.route('/')
def index():
    return render_template('index.html')

# Rota para buscar as transações
@app.route('/transacoes', methods=['GET'])
def listar_transacoes():
    df = pd.read_excel(EXCEL_FILE)
    return jsonify(df.to_dict(orient="records"))

# Rota para adicionar transação
@app.route('/transacoes', methods=['POST'])
def adicionar_transacao():
    dados = request.get_json()
    df = pd.read_excel(EXCEL_FILE)

    # Criar um novo ID para a transação
    novo_id = df["id"].max() + 1 if not df.empty else 1
    mes = datetime.now().strftime("%Y-%m")  # Captura o mês atual
    nova_transacao = {"id": novo_id, "tipo": dados["tipo"], "valor": dados["valor"], "setor": dados["setor"], "mes": mes}

    df = pd.concat([df, pd.DataFrame([nova_transacao])], ignore_index=True)
    df.to_excel(EXCEL_FILE, index=False)

    return jsonify({"mensagem": "Transação adicionada com sucesso"}), 201

# Rota para excluir transação
@app.route('/transacoes/<int:id>', methods=['DELETE'])
def excluir_transacao(id):
    df = pd.read_excel(EXCEL_FILE)
    df = df[df["id"] != id]  # Remove a transação pelo ID
    df.to_excel(EXCEL_FILE, index=False)
    return jsonify({"mensagem": "Transação removida"}), 200

if __name__ == '__main__':
    app.run(debug=True)
