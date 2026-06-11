document.addEventListener("DOMContentLoaded", () => {
    const sliderNota = document.getElementById("slider-nota");
    const valorNota = document.getElementById("valor-nota");
    const btnEnviar = document.getElementById("btn-enviar");
    const textoComentario = document.getElementById("texto-comentario");
    const containerComentarios = document.getElementById("container-comentarios");

    // Recupere os comentários salvos anteriormente ou inicia uma lista vazia
    let listaComentarios = JSON.parse(localStorage.getItem("brandbook_feedbacks")) || [];

    // Atualiza o número da nota na tela enquanto move o slider
    sliderNota.addEventListener("input", (e) => {
        valorNota.textContent = e.target.value;
    });

    // Função para renderizar os comentários na tela
    function renderizarComentarios() {
        containerComentarios.innerHTML = ""; // Limpa a lista antes de re-renderizar
        
        if (listaComentarios.length === 0) {
            containerComentarios.innerHTML = `<p style="color: #666; font-style: italic; font-size: 14px;">Nenhum comentário enviado ainda.</p>`;
            return;
        }

        // Faz o reverse (comentário mais recente no topo)
        [...listaComentarios].reverse().forEach(comentario => {
            const div = document.createElement("div");
            div.className = "card-comentario";
            
            // Adicionado uma pequena estilização inline opcional para alinhar com o design premium
            div.style.background = "#fff";
            div.style.padding = "15px";
            div.style.borderRadius = "12px";
            div.style.marginBottom = "15px";
            div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.04)";
            div.style.borderLeft = "4px solid #5B2A8C";

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #2D0B48; font-size: 15px;">⭐ Nota: ${comentario.nota}/10</strong>
                    <span style="font-size: 12px; color: #999;">Enviado</span>
                </div>
                <p style="margin: 8px 0 0 0; color: #444; font-size: 14px; line-height: 1.5;">${comentario.texto}</p>
            `;
            containerComentarios.appendChild(div);
        });
    }

    // Evento de clique no botão Enviar
    btnEnviar.addEventListener("click", () => {
        const texto = textoComentario.value.trim();
        const nota = sliderNota.value;

        if (texto === "") {
            alert("Por favor, digite um comentário antes de enviar!");
            return;
        }

        // Adiciona o objeto na lista
        listaComentarios.push({ texto: texto, nota: nota });

        // Salva a lista atualizada de forma segura no navegador
        localStorage.setItem("brandbook_feedbacks", JSON.stringify(listaComentarios));

        // Limpa o campo de texto e reinicia o slider
        textoComentario.value = "";
        sliderNota.value = 10;
        valorNota.textContent = 10;

        // Atualiza a visualização na tela
        renderizarComentarios();
    });

    // Roda a renderização ao carregar a página para exibir os comentários históricos salvos
    renderizarComentarios();
});