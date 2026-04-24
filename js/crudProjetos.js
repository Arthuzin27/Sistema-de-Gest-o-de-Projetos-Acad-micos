function voltarPagina() {
    window.history.back();
}

function getProjetos() {
    return JSON.parse(localStorage.getItem("projetos")) || [];
}

function salvarProjetos(lista) {
    localStorage.setItem("projetos", JSON.stringify(lista));
}

function getGrupos() {
    return JSON.parse(localStorage.getItem("grupos")) || [];
}

function getAvaliacoes() {
    return JSON.parse(localStorage.getItem("avaliacoes")) || [];
}

function getEstandes() {
    return JSON.parse(localStorage.getItem("estandes")) || [];
}

function getHorarios() {
    return JSON.parse(localStorage.getItem("horarios_apresentacao")) || [];
}

function gerarId() {
    return Date.now();
}

function grupoJaPossuiProjeto(grupoId, projetoIdIgnorar = null) {
    const projetos = getProjetos();
    return projetos.some(p => p.grupo_id == grupoId && p.id != projetoIdIgnorar);
}

function tituloExiste(titulo, projetoIdIgnorar = null) {
    const projetos = getProjetos();
    return projetos.some(p => p.titulo.toLowerCase() === titulo.toLowerCase() && p.id != projetoIdIgnorar);
}

function projetoPossuiVinculos(projetoId) {
    const avaliacoes = getAvaliacoes();
    const estandes = getEstandes();
    const horarios = getHorarios();

    const temAvaliacao = avaliacoes.some(a => a.projeto_id == projetoId);
    const temEstande = estandes.some(e => e.projeto_id == projetoId);
    const temHorario = horarios.some(h => h.projeto_id == projetoId);

    return temAvaliacao || temEstande || temHorario;
}

function carregarGruposDisponiveis(projetoId = null) {
    const grupos = getGrupos();
    const projetos = getProjetos();
    const grupoSelect = document.getElementById("grupo_id");

    const gruposComProjeto = projetos.map(p => p.grupo_id);

    grupoSelect.innerHTML = '<option value="">Selecione um grupo</option>';

    grupos.forEach(grupo => {
        const grupoJaUsado = gruposComProjeto.includes(grupo.id);
        const isGrupoAtual = projetoId && projetos.find(p => p.id == projetoId)?.grupo_id == grupo.id;

        if (!grupoJaUsado || isGrupoAtual) {
            const option = document.createElement("option");
            option.value = grupo.id;

            option.textContent = `Grupo ${grupo.id} - Turma ${grupo.turma_id}`;

            grupoSelect.appendChild(option);
        }
    });

    if (grupoSelect.options.length === 1) {
        const option = document.createElement("option");
        option.disabled = true;
        option.textContent = "Nenhum grupo disponível";
        grupoSelect.appendChild(option);
    }
}

function resumirDescricao(descricao, limite = 50) {
    if (descricao.length <= limite) return descricao;
    return descricao.substring(0, limite) + "...";
}

function listar() {
    const busca = document.getElementById("busca")?.value.toLowerCase() || "";
    let lista = getProjetos();
    const grupos = getGrupos();
    const tbody = document.getElementById("tabelaProjetos");
    tbody.innerHTML = "";

    if (busca) {
        lista = lista.filter(p => p.titulo.toLowerCase().includes(busca));
    }

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr class="mensagem-vazia">
                <td colspan="4">Nenhum projeto cadastrado ainda. Clique em "+ Novo Projeto" para começar.</td>
            </tr>
        `;
        return;
    }

    lista.forEach(projeto => {
        const grupo = grupos.find(g => g.id == projeto.grupo_id);
        const nomeGrupo = grupo ? `Grupo ${grupo.id}` : "Grupo não encontrado";
        const descricaoResumida = resumirDescricao(projeto.descricao, 50);

        tbody.innerHTML += `
            <tr>
                <td><strong>${escapeHtml(projeto.titulo)}</strong></td>
                <td><span class="badge-grupo">${escapeHtml(nomeGrupo)}</span></td>
                <td class="descricao-resumida">${escapeHtml(descricaoResumida)}</td>
                <td class="action-buttons">
                    <button onclick="editar(${projeto.id})">Editar</button>
                    <button onclick="abrirModalExclusao(${projeto.id}, '${escapeHtml(projeto.titulo)}')">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function escapeHtml(texto) {
    if (!texto) return "";
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

function validarFormulario(dados) {
    if (dados.titulo.length < 5) {
        alert("Título deve ter no mínimo 5 caracteres.");
        return false;
    }

    if (tituloExiste(dados.titulo, dados.id)) {
        alert("Já existe um projeto com este título. Por favor, utilize um título único.");
        return false;
    }

    if (dados.descricao.length < 10) {
        alert("Descrição deve ter no mínimo 10 caracteres.");
        return false;
    }

    if (!dados.grupo_id) {
        alert("Selecione um grupo para vincular ao projeto.");
        return false;
    }

    if (grupoJaPossuiProjeto(dados.grupo_id, dados.id)) {
        alert("Este grupo já possui um projeto cadastrado. Cada grupo pode ter no máximo um projeto.");
        return false;
    }

    return true;
}

function salvar() {
    const id = document.getElementById("id").value;
    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const grupo_id = document.getElementById("grupo_id").value;

    const dados = {
        id: id ? Number(id) : null,
        titulo: titulo,
        descricao: descricao,
        grupo_id: grupo_id ? Number(grupo_id) : null
    };

    if (!validarFormulario(dados)) {
        return;
    }

    let lista = getProjetos();

    if (id) {
        lista = lista.map(p => p.id == id ? {
            id: Number(id),
            titulo: dados.titulo,
            descricao: dados.descricao,
            grupo_id: dados.grupo_id
        } : p);
        alert("Projeto atualizado com sucesso!");
    } else {
        dados.id = gerarId();
        lista.push(dados);
        alert("Projeto cadastrado com sucesso!");
    }

    salvarProjetos(lista);
    cancelarFormulario();
    listar();
}

function editar(id) {
    const lista = getProjetos();
    const projeto = lista.find(p => p.id === id);

    if (!projeto) return;

    document.getElementById("id").value = projeto.id;
    document.getElementById("titulo").value = projeto.titulo;
    document.getElementById("descricao").value = projeto.descricao;

    carregarGruposDisponiveis(id);
    document.getElementById("grupo_id").value = projeto.grupo_id;

    document.getElementById("tituloForm").textContent = "Editar Projeto";
    document.getElementById("formSection").style.display = "block";
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

let projetoIdParaExcluir = null;

function abrirModalExclusao(id, titulo) {
    projetoIdParaExcluir = id;
    document.getElementById("projetoTitulo").textContent = titulo;
    document.getElementById("modalExclusao").style.display = "flex";
}

function fecharModalExclusao() {
    projetoIdParaExcluir = null;
    document.getElementById("modalExclusao").style.display = "none";
}

function confirmarExclusao() {
    if (!projetoIdParaExcluir) return;

    if (projetoPossuiVinculos(projetoIdParaExcluir)) {
        alert("Não é possível excluir este projeto. Ele possui avaliações, estande ou horário de apresentação vinculados.");
        fecharModalExclusao();
        return;
    }

    const lista = getProjetos();
    const projeto = lista.find(p => p.id === projetoIdParaExcluir);

    if (!projeto) {
        fecharModalExclusao();
        return;
    }

    const novaLista = lista.filter(p => p.id !== projetoIdParaExcluir);
    salvarProjetos(novaLista);

    alert(`Projeto "${projeto.titulo}" excluído com sucesso!`);
    fecharModalExclusao();
    listar();
}

function abrirFormulario() {
    document.getElementById("formProjeto").reset();
    document.getElementById("id").value = "";
    document.getElementById("tituloForm").textContent = "Novo Projeto";
    carregarGruposDisponiveis();
    document.getElementById("formSection").style.display = "block";
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

function cancelarFormulario() {
    document.getElementById("formProjeto").reset();
    document.getElementById("id").value = "";
    document.getElementById("formSection").style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById("modalExclusao");
    if (event.target === modal) {
        fecharModalExclusao();
    }
}

function inicializarDadosExemplo() {
    const projetos = getProjetos();
    const grupos = getGrupos();

    if (projetos.length === 0 && grupos.length > 0) {
        const projetosExemplo = [
            {
                id: gerarId(),
                titulo: "Sistema de Gestão Acadêmica",
                descricao: "Desenvolvimento de uma plataforma web para gerenciamento de atividades acadêmicas, incluindo notas, frequência e relatórios.",
                grupo_id: grupos[0]?.id
            },
            {
                id: gerarId(),
                titulo: "Aplicativo de Mobilidade Urbana",
                descricao: "Criação de um aplicativo para otimizar rotas de transporte público e compartilhamento de caronas na cidade.",
                grupo_id: grupos[1]?.id
            }
        ].filter(p => p.grupo_id);

        if (projetosExemplo.length > 0) {
            salvarProjetos(projetosExemplo);
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const btnBuscar = document.getElementById("btnBuscar");
    if (btnBuscar) {
        btnBuscar.addEventListener("click", listar);
    }

    const buscaInput = document.getElementById("busca");
    if (buscaInput) {
        buscaInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                listar();
            }
        });
    }

    const form = document.getElementById("formProjeto");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            salvar();
        });
    }

    inicializarDadosExemplo();

    listar();
});
