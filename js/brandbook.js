document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // SE PRECISAR, ADICIONE SEUS OUTROS SCRIPTS (HOVER, MENUS, ETC.) AQUI:
    // =========================================================================


    // =========================================================================
    // SISTEMA DE NOTIFICAÇÃO CUSTOMIZADO (Substitui os alerts bloqueados em iframe)
    // =========================================================================
    function mostrarNotificacao(mensagem, tipo = "erro") {
        const existente = document.getElementById("custom-toast-notification");
        if (existente) existente.remove();

        const toast = document.createElement("div");
        toast.id = "custom-toast-notification";
        
        toast.style.position = "fixed";
        toast.style.bottom = "24px";
        toast.style.right = "24px";
        toast.style.padding = "16px 24px";
        toast.style.borderRadius = "12px";
        toast.style.color = "#ffffff";
        toast.style.fontSize = "14px";
        toast.style.fontWeight = "500";
        toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
        toast.style.zIndex = "99999";
        toast.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        toast.style.display = "flex";
        toast.style.alignItems = "center";
        toast.style.gap = "10px";
        toast.style.fontFamily = "system-ui, -apple-system, sans-serif";

        if (tipo === "sucesso") {
            toast.style.backgroundColor = "#10B981";
            toast.innerHTML = `<span>✨</span> <span>${mensagem}</span>`;
        } else {
            toast.style.backgroundColor = "#EF4444";
            toast.innerHTML = `<span>⚠️</span> <span>${mensagem}</span>`;
        }

        document.body.appendChild(toast);

        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px)";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }


    // =========================================================================
    // SISTEMA DE FEEDBACK & COMENTÁRIOS (Preservado e Protegido)
    // =========================================================================
    const sliderNota = document.getElementById("slider-nota");
    const valorNota = document.getElementById("valor-nota");
    const btnEnviar = document.getElementById("btn-enviar");
    const textoComentario = document.getElementById("texto-comentario");
    const nomeComentario = document.getElementById("nome-comentario");
    const cargoComentario = document.getElementById("cargo-comentario");
    const containerComentarios = document.getElementById("container-comentarios");

    let listaComentarios = JSON.parse(localStorage.getItem("brandbook_feedbacks")) || [];

    if (sliderNota && valorNota) {
        sliderNota.addEventListener("input", (e) => {
            valorNota.textContent = e.target.value;
        });
    }

    function renderizarComentarios() {
        if (!containerComentarios) return;
        
        containerComentarios.innerHTML = "";
        
        if (listaComentarios.length === 0) {
            containerComentarios.innerHTML = `<p style="color: #666; font-style: italic; font-size: 14px;">Nenhum comentário enviado ainda.</p>`;
            return;
        }

        [...listaComentarios].reverse().forEach(comentario => {
            const div = document.createElement("div");
            div.className = "card-comentario";
            
            div.style.background = "#fff";
            div.style.padding = "15px";
            div.style.borderRadius = "12px";
            div.style.marginBottom = "15px";
            div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.04)";
            div.style.borderLeft = "4px solid #5B2A8C";

            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">

                    <div>
                    <strong style="
                        color:#2D0B48;
                        font-size:16px;
                        display:block;
                            ">
                         ${comentario.nome || "Visitante"}
                        </strong>

            <span style="
                        color:#777;
                        font-size:13px;
                        ">
                ${comentario.cargo || "Não informado"}
            </span>
        </div>

        <div style="
            text-align:right;
            font-size:13px;
            color:#666;
        ">
            ⭐ ${comentario.nota}/10
            <br>
            ${comentario.data || ""}
        </div>

    </div>

    <p style="
        margin:0;
        color:#444;
        font-size:14px;
        line-height:1.6;
    ">
        ${comentario.texto}
    </p>
`;
            containerComentarios.appendChild(div);
        });
    }

    if (btnEnviar && textoComentario) {
        btnEnviar.addEventListener("click", () => {
            const texto = textoComentario.value.trim();
            const nota = sliderNota ? sliderNota.value : 10;

            if (texto === "") {
                mostrarNotificacao("Por favor, digite um comentário antes de enviar!");
                return;
            }

            listaComentarios.push({
                nome:
                    nomeComentario?.value.trim() ||
                    "Visitante",

                cargo:
                    cargoComentario?.value.trim() ||
                    "Não informado",

            texto: texto,

            nota: nota,

            data:
                    new Date().toLocaleDateString("pt-BR")

});

            localStorage.setItem("brandbook_feedbacks", JSON.stringify(listaComentarios));

            textoComentario.value = "";
            nomeComentario.value = "";
            cargoComentario.value = "";
            if (sliderNota && valorNota) {
                sliderNota.value = 10;
                valorNota.textContent = 10;
            }

            renderizarComentarios();
            mostrarNotificacao("Comentário enviado com sucesso!", "sucesso");
        });
    }

    renderizarComentarios();


    // =========================================================================
    // EXPORTAR PDF (Com Algoritmo Inteligente de Detecção de Quebra de Página)
    // =========================================================================
    const btnPDF = document.getElementById("btn-download-pdf");

    if (btnPDF) {
        btnPDF.addEventListener("click", async () => {
            try {
                btnPDF.disabled = true;
                btnPDF.textContent = "Gerando PDF...";

                const { jsPDF } = window.jspdf;
                const elemento = document.getElementById("brandbook-pdf");

                if (!elemento) {
                    mostrarNotificacao("Elemento do Brandbook não encontrado.");
                    btnPDF.disabled = false;
                    btnPDF.textContent = "📄 Exportar Brandbook (.PDF)";
                    return;
                }

                // Remove temporariamente classes indesejadas do PDF
                const elementosOcultar = elemento.querySelectorAll(".no-pdf");
                elementosOcultar.forEach(el => el.style.display = "none");

                // Renderiza o documento completo em um canvas de alta resolução
                const canvas = await html2canvas(elemento, {
                    scale: 2.0, // Alta resolução para fidelidade visual premium
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: false
                });

                // Restaura a visualização dos elementos ocultos na tela
                elementosOcultar.forEach(el => el.style.display = "");

                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });

                const larguraPagina = 210;
                const alturaPagina = 297;
                const margem = 10;
                const larguraUtil = larguraPagina - (margem * 2);
                const alturaUtilPagina = alturaPagina - (margem * 2);

                // Converte a altura útil da página do PDF em pixels equivalentes ao Canvas
                const proporcaoPixelMM = canvas.width / larguraUtil;
                const alturaPaginaPx = alturaUtilPagina * proporcaoPixelMM;

                let sliceStart = 0;
                const totalHeight = canvas.height;
                const ctx = canvas.getContext("2d");

                let primeiraPagina = true;

                while (sliceStart < totalHeight) {
                    let sliceHeight = alturaPaginaPx;

                    // Se não for a última página, analisa os pixels para achar a quebra de linha em branco perfeita
                    if (sliceStart + sliceHeight < totalHeight) {
                        // Define uma zona de busca de quebra de página (últimos 25% da folha corrente)
                        const searchZoneStart = Math.floor(sliceStart + sliceHeight - (alturaPaginaPx * 0.25));
                        const searchZoneEnd = Math.floor(sliceStart + sliceHeight);

                        // Captura os dados de cor desta região específica do canvas
                        const imgDataRegion = ctx.getImageData(0, searchZoneStart, canvas.width, searchZoneEnd - searchZoneStart);
                        const pixels = imgDataRegion.data;

                        let melhorLinhaDeCorte = searchZoneEnd - 1;
                        let encontrouLinhaEmBranco = false;
                        let menorDensidadeDePixel = canvas.width;

                        // Analisa a região de baixo para cima para maximizar o preenchimento da folha
                        for (let y = searchZoneEnd - 1; y >= searchZoneStart; y--) {
                            const offsetLinha = (y - searchZoneStart) * canvas.width * 4;
                            let pixelsColoridos = 0;

                            for (let x = 0; x < canvas.width; x++) {
                                const idx = offsetLinha + (x * 4);
                                const r = pixels[idx];
                                const g = pixels[idx + 1];
                                const b = pixels[idx + 2];
                                const a = pixels[idx + 3];

                                // Considera pixels não brancos ou com opacidade ativa (textos, imagens, fundos coloridos)
                                if (a > 10 && (r < 248 || g < 248 || b < 248)) {
                                    pixelsColoridos++;
                                }
                            }

                            // Linha perfeita encontrada (0% a 1.5% de ruído visual de renderização)
                            if (pixelsColoridos <= canvas.width * 0.015) {
                                melhorLinhaDeCorte = y;
                                encontrouLinhaEmBranco = true;
                                break;
                            }

                            // Caso não encontre uma linha 100% limpa, armazena a linha com menor poluição visual
                            if (pixelsColoridos < menorDensidadeDePixel) {
                                menorDensidadeDePixel = pixelsColoridos;
                                melhorLinhaDeCorte = y;
                            }
                        }

                        sliceHeight = melhorLinhaDeCorte - sliceStart;
                    } else {
                        // Última página pega o restante total
                        sliceHeight = totalHeight - sliceStart;
                    }

                    // Cria um mini canvas temporário contendo apenas o fragmento sem cortes da página atual
                    const canvasSlice = document.createElement("canvas");
                    canvasSlice.width = canvas.width;
                    canvasSlice.height = sliceHeight;
                    const ctxSlice = canvasSlice.getContext("2d");

                    ctxSlice.drawImage(
                        canvas,
                        0, sliceStart, canvas.width, sliceHeight, // Recorta do canvas original
                        0, 0, canvas.width, sliceHeight          // Desenha no novo fragmento
                    );

                    const sliceImgData = canvasSlice.toDataURL("image/jpeg", 0.92);

                    if (!primeiraPagina) {
                        pdf.addPage();
                    } else {
                        primeiraPagina = false;
                    }

                    // Calcula a altura proporcional no PDF
                    const alturaProporcionalPDF = (sliceHeight * larguraUtil) / canvas.width;

                    pdf.addImage(
                        sliceImgData,
                        "JPEG",
                        margem,
                        margem,
                        larguraUtil,
                        alturaProporcionalPDF
                    );

                    sliceStart += sliceHeight;
                }

                // Adiciona o rodapé oficial e numeração de página centralizada
                const totalPaginas = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPaginas; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(8);
                    pdf.setTextColor("#999999");
                    
                    // Desenha uma linha fina separadora no rodapé
                    pdf.setDrawColor("#E2E8F0");
                    pdf.setLineWidth(0.2);
                    pdf.line(margem, 285, larguraPagina - margem, 285);

                    pdf.text(
                        `Açaí Vida • Brandbook Acadêmico • Página ${i} de ${totalPaginas}`,
                        larguraPagina / 2,
                        291,
                        { align: "center" }
                    );
                }

                pdf.save("Brandbook_Acai_Vida.pdf");
                mostrarNotificacao("PDF exportado com sucesso!", "sucesso");

            } catch (erro) {
                console.error(erro);
                mostrarNotificacao("Erro ao gerar PDF.");
            } finally {
                btnPDF.disabled = false;
                btnPDF.textContent = "📄 Exportar Brandbook (.PDF)";
            }
        });
    }


    // =========================================================================
    // DOWNLOAD ZIP DAS IMAGENS
    // =========================================================================
    const btnZIP = document.getElementById("btn-download-zip");

    if (btnZIP) {
        btnZIP.addEventListener("click", async () => {
            try {
                btnZIP.disabled = true;
                btnZIP.textContent = "Criando ZIP...";

                const zip = new JSZip();
                const imagens = document.querySelectorAll("img");

                if (imagens.length === 0) {
                    mostrarNotificacao("Nenhuma imagem encontrada para baixar.");
                    btnZIP.disabled = false;
                    btnZIP.textContent = "📁 Baixar Imagens (.ZIP)";
                    return;
                }

                let imagensAdicionadas = 0;

                for (let i = 0; i < imagens.length; i++) {
                    try {
                        const url = imagens[i].src;
                        if (url.startsWith('data:')) continue;

                        const response = await fetch(url);
                        const blob = await response.blob();
                        
                        let nomeArquivo = url.split("/").pop().split("?")[0];
                        if (!nomeArquivo || !nomeArquivo.includes('.')) {
                            nomeArquivo = `imagem_${i + 1}.png`;
                        }

                        zip.file(nomeArquivo, blob);
                        imagensAdicionadas++;
                    } catch (erro) {
                        console.error(`Erro ao processar imagem ${i}:`, erro);
                    }
                }

                if (imagensAdicionadas === 0) {
                    mostrarNotificacao("Não foi possível transferir nenhuma imagem externa (CORS).");
                    return;
                }

                const conteudoZIP = await zip.generateAsync({ type: "blob" });
                saveAs(conteudoZIP, "Brandbook_Acai_Vida_Imagens.zip");
                mostrarNotificacao("Imagens baixadas com sucesso!", "sucesso");

            } catch (erro) {
                console.error("Erro geral no ZIP:", erro);
                mostrarNotificacao("Erro ao gerar arquivo ZIP.");
            } finally {
                btnZIP.disabled = false;
                btnZIP.textContent = "📁 Baixar Imagens (.ZIP)";
            }
        });
    }
    // =====================================================
    // LIGHTBOX DAS IMAGENS (CORRIGIDO COM FADE-IN/OUT)
    // =====================================================
        const modal = document.getElementById("modal-imagem");
        const imagemAmpliada = document.getElementById("imagem-ampliada");
        const fecharModal = document.getElementById("fechar-modal");

        if (modal && imagemAmpliada && fecharModal) {
         document.querySelectorAll(".card-midia img").forEach(img => {
            img.style.cursor = "pointer"; // Indica visualmente que a imagem é clicável

            img.addEventListener("click", () => {
                imagemAmpliada.src = img.src;
                imagemAmpliada.alt = img.alt;

                modal.style.display = "flex";
                // Pequeno atraso milimétrico para permitir que o navegador renderize o display antes da animação
                setTimeout(() => {
                    modal.style.opacity = "1";
                }, 10);
            });
        });

        // Função isolada para fechar o modal com transição suave
        const fecharOModal = () => {
            modal.style.opacity = "0";
            // Aguarda o término da transição do CSS (0.25s) para esconder o elemento
            setTimeout(() => {
                modal.style.display = "none";
                imagemAmpliada.src = ""; // Limpa o cache da imagem
            }, 250);
        };

        fecharModal.addEventListener("click", fecharOModal);

        modal.addEventListener("click", (e) => {
            // Se clicar na área escura (fora do slide de conteúdo), fecha o modal
            if (e.target === modal) {
                fecharOModal();
            }
        });
    }
    });