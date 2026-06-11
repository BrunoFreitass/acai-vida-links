const tamanhos = {
    250: { preco: 13, frutas: 1, acompanhamentos: 1, caldas: 1 },
    300: { preco: 15, frutas: 1, acompanhamentos: 2, caldas: 1 },
    400: { preco: 18, frutas: 1, acompanhamentos: 2, caldas: 2 },
    500: { preco: 22, frutas: 2, acompanhamentos: 2, caldas: 2 },
    700: { preco: 28, frutas: 3, acompanhamentos: 3, caldas: 3 }
};

const frutas = ["Abacate", "Abacaxi", "Banana", "Mamão", "Manga", "Maçã", "Uva"];
const acompanhamentos = ["Amendoim", "Farinha de Tapioca", "Farinha Láctea", "Flocos de Arroz", "Granola", "Leite em Pó", "Neston"];
const caldas = ["Banana", "Chocolate", "Leite Condensado", "Mel", "Morango"];
const premium = [
    { nome: "Doce de Leite", valor: 3 },
    { nome: "Kiwi", valor: 2 },
    { nome: "M&M's", valor: 3 },
    { nome: "Ovomaltine", valor: 3 }
];

const configurador = document.getElementById("configurador");

document.querySelectorAll(".tamanho").forEach(botao => {
    botao.addEventListener("click", () => {
        const tamanho = botao.dataset.tamanho;
        abrirConfigurador(tamanho);
    });
});

function abrirConfigurador(tamanho) {
    window.tamanhoAtual = tamanho;
    const dados = tamanhos[tamanho];

    configurador.innerHTML = `
    <div class="formulario">
        <h2>🥤 Açaí ${tamanho}ml</h2>
        <div class="info">
            <strong>Incluso no copo:</strong> ${dados.frutas} fruta(s), ${dados.acompanhamentos} acomp. e ${dados.caldas} calda(s).
        </div>

        <div class="dados-cliente">
            <input type="text" id="nome" placeholder="Seu nome (Obrigatório)">
            <input type="text" id="telefone" placeholder="WhatsApp (Obrigatório)">
            <input type="text" id="endereco" placeholder="Endereço de Entrega (Obrigatório)">
        </div>

        <h3>🍓 Escolha as Frutas</h3>
        <div id="lista-frutas" class="grid-opcoes"></div>

        <h3>🥣 Escolha os Acompanhamentos</h3>
        <div id="lista-acomp" class="grid-opcoes"></div>

        <h3>🍯 Escolha as Caldas</h3>
        <div id="lista-caldas" class="grid-opcoes"></div>

        <h3>⭐ Adicionais Premium</h3>
        <div id="lista-premium" class="grid-opcoes"></div>

        <div class="alertas-limite">
            <div id="contador-frutas"></div>
            <div id="contador-acomp"></div>
            <div id="contador-caldas"></div>
        </div>

        <div id="resumo-pedido"></div>

        <button id="whatsapp" disabled>🟢 Enviar Pedido via WhatsApp</button>
    </div>
    `;

    gerarOpcoes();
    ativarCalculo();
    calcularTotal();

    document.getElementById("nome").addEventListener("input", validarBotao);
    document.getElementById("telefone").addEventListener("input", validarBotao);
    document.getElementById("endereco").addEventListener("input", validarBotao);
    document.getElementById("whatsapp").addEventListener("click", enviarPedido);
}

function gerarOpcoes() {
    document.getElementById("lista-frutas").innerHTML = frutas.map(item => `
        <label><input type="checkbox" class="fruta" value="${item}"> ${item}</label>
    `).join("");

    document.getElementById("lista-acomp").innerHTML = acompanhamentos.map(item => `
        <label><input type="checkbox" class="acomp" value="${item}"> ${item}</label>
    `).join("");

    document.getElementById("lista-caldas").innerHTML = caldas.map(item => `
        <label><input type="checkbox" class="calda" value="${item}"> ${item}</label>
    `).join("");

    document.getElementById("lista-premium").innerHTML = premium.map(item => `
        <label>
            <input type="checkbox" class="premium" value="${item.valor}" data-nome="${item.nome}"> 
            ${item.nome} (+R$ ${item.valor.toFixed(2)})
        </label>
    `).join("");
}

function ativarCalculo() {
    document.querySelectorAll("input[type='checkbox']").forEach(item => {
        item.addEventListener("change", () => {
            calcularTotal();
            validarBotao();
        });
    });
}

function calcularTotal() {
    const tamanho = window.tamanhoAtual;
    const config = tamanhos[tamanho];
    let total = config.preco;

    const frutasSelecionadas = document.querySelectorAll(".fruta:checked").length;
    const acompSelecionados = document.querySelectorAll(".acomp:checked").length;
    const caldasSelecionadas = document.querySelectorAll(".calda:checked").length;
    const premiumSelecionados = document.querySelectorAll(".premium:checked");

    const frutasExtras = Math.max(0, frutasSelecionadas - config.frutas);
    const acompExtras = Math.max(0, acompSelecionados - config.acompanhamentos);
    const caldasExtras = Math.max(0, caldasSelecionadas - config.caldas);

    total += frutasExtras * 2;   
    total += acompExtras * 3;    
    total += caldasExtras * 1.5; 

    premiumSelecionados.forEach(item => {
        total += parseFloat(item.value);
    });

    // Injeção limpa de texto sem quebrar os parênteses
    document.getElementById("contador-frutas").innerHTML = `🍓 <strong>Frutas:</strong> ${frutasSelecionadas}/${config.frutas} ${frutasExtras > 0 ? `<span class="extra">(+ R$ ${(frutasExtras * 2).toFixed(2)})</span>` : "✅"}`;
    document.getElementById("contador-acomp").innerHTML = `🥣 <strong>Acomp.:</strong> ${acompSelecionados}/${config.acompanhamentos} ${acompExtras > 0 ? `<span class="extra">(+ R$ ${(acompExtras * 3).toFixed(2)})</span>` : "✅"}`;
    document.getElementById("contador-caldas").innerHTML = `🍯 <strong>Caldas:</strong> ${caldasSelecionadas}/${config.caldas} ${caldasExtras > 0 ? `<span class="extra">(+ R$ ${(caldasExtras * 1.5).toFixed(2)})</span>` : "✅"}`;

    let resumoPremium = "";
    premiumSelecionados.forEach(item => {
        resumoPremium += `<br>• Adicional: ${item.dataset.nome} (R$ ${parseFloat(item.value).toFixed(2)})`;
    });

    document.getElementById("resumo-pedido").innerHTML = `
        <div class="box-resumo">
            <strong>💰 RESUMO DO VALOR</strong><br>
            • Copo Base ${tamanho}ml: R$ ${config.preco.toFixed(2)}
            ${frutasExtras > 0 ? `<br>• Frutas Extras: R$ ${(frutasExtras * 2).toFixed(2)}` : ""}
            ${acompExtras > 0 ? `<br>• Acomp. Extras: R$ ${(acompExtras * 3).toFixed(2)}` : ""}
            ${caldasExtras > 0 ? `<br>• Caldas Extras: R$ ${(caldasExtras * 1.5).toFixed(2)}` : ""}
            ${resumoPremium}
            <hr style="margin:10px 0; border:none; border-top:1px dashed #ddd;">
            <div style="font-size:18px; font-weight:bold; color:#2D0B48;">TOTAL: R$ ${total.toFixed(2)}</div>
        </div>
    `;

    window.valorTotalPedido = total;
}

function validarBotao() {
    const nomeInput = document.getElementById("nome");
    const telefoneInput = document.getElementById("telefone");
    const enderecoInput = document.getElementById("endereco");

    // Prevenção contra travamento caso os inputs ainda não existam na tela
    if (!nomeInput || !telefoneInput || !enderecoInput) return;

    const nome = nomeInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const endereco = enderecoInput.value.trim();

    const camposValidos = nome !== "" && telefone !== "" && endereco !== "";
    const botao = document.getElementById("whatsapp");
    
    if (botao) {
        botao.disabled = !camposValidos;
    }
}

function enviarPedido() {
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const endereco = document.getElementById("endereco").value.trim();

    const frutas = [...document.querySelectorAll(".fruta:checked")].map(i => i.value);
    const acomp = [...document.querySelectorAll(".acomp:checked")].map(i => i.value);
    const caldas = [...document.querySelectorAll(".calda:checked")].map(i => i.value);
    const premium = [...document.querySelectorAll(".premium:checked")].map(i => `${i.dataset.nome} (+R$ ${parseFloat(i.value).toFixed(2)})`);

    const mensagem = `Olá! Gostaria de fazer um pedido.\n\n🍇 *NOVO PEDIDO - AÇAÍ VIDA* 🍇\n\n👤 *Cliente:* ${nome}\n📞 *WhatsApp:* ${telefone}\n📍 *Endereço:* ${endereco}\n\n🥤 *Copo:* ${window.tamanhoAtual}ml\n🍓 *Frutas:* ${frutas.length ? frutas.join(", ") : "Nenhuma"}\n🥣 *Acompanhamentos:* ${acomp.length ? acomp.join(", ") : "Nenhum"}\n🍯 *Caldas:* ${caldas.length ? caldas.join(", ") : "Nenhuma"}\n⭐ *Premium:* ${premium.length ? premium.join(", ") : "Nenhum"}\n\n---\n*Total a Pagar: R$ ${window.valorTotalPedido.toFixed(2)}*`;

    const url = "https://wa.me/5595981162474?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank");
}

