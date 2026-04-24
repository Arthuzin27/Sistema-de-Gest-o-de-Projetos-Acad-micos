function voltarPagina() {
    window.history.back();
}

const getProjetos    = () => JSON.parse(localStorage.getItem("projetos"))              || [];
const getEstandes    = () => JSON.parse(localStorage.getItem("estandes"))              || [];
const getHorarios    = () => JSON.parse(localStorage.getItem("horarios_apresentacao")) || [];

const salvarEstandes = (lista) => localStorage.setItem("estandes", JSON.stringify(lista));
const salvarHorarios = (lista) => localStorage.setItem("horarios_apresentacao", JSON.stringify(lista));

let projetoIdEmEdicao = null;

function listarTudo() {
    const tbody    = document.getElementById("tabelaEstandesHorarios");
    const busca    = document.getElementById("busca").value.toLowerCase().trim();
    const estandes = getEstandes();
    const horarios = getHorarios();
    tbody.innerHTML = "";

    const lista = getProjetos().filter(p => {
        const est = estandes.find(e => e.projeto_id === p.id);
        const hor = horarios.find(h => h.projeto_id === p.id);
        if (!est && !hor) return false;
        return !busca
            || p.titulo.toLowerCase().includes(busca)
            || (est && est.localizacao.toLowerCase().includes(busca));
    });

    if (lista.length === 0) {
        tbody.innerHTML = `<tr class="mensagem-vazia"><td colspan="4">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    lista.forEach(p => {
        const est = estandes.find(e => e.projeto_id === p.id);
        const hor = horarios.find(h => h.projeto_id === p.id);

        tbody.innerHTML += `
            <tr>
                <td><strong>${p.titulo}</strong></td>
                <td>${est ? est.localizacao : '<em style="color:#999">Não definido</em>'}</td>
                <td>${hor ? new Date(hor.data_hora).toLocaleString('pt-BR') : '<em style="color:#999">Não agendado</em>'}</td>
                <td>
                    <button class="btn-editar" onclick="abrirEdicao(${p.id})">Editar</button>
                    <button class="btn-excluir" onclick="excluirItem(${p.id})">Excluir</button>
                </td>
            </tr>`;
    });
}

function abrirEdicao(projetoId) {
    fecharForms();
    projetoIdEmEdicao = projetoId;

    const est = getEstandes().find(e => e.projeto_id === projetoId);
    const hor = getHorarios().find(h => h.projeto_id === projetoId);

    document.getElementById("edit_localizacao").value = est ? est.localizacao : "";
    document.getElementById("edit_data_hora").value   = hor ? hor.data_hora   : "";

    document.getElementById("formEdicaoSection").style.display = "block";
    document.getElementById("formEdicaoSection").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("formEdicao").addEventListener("submit", (e) => {
    e.preventDefault();

    const novaLoc      = document.getElementById("edit_localizacao").value.trim();
    const novaDataHora = document.getElementById("edit_data_hora").value;

    if (!novaLoc && !novaDataHora) {
        alert("Preencha ao menos um campo para salvar.");
        return;
    }

    if (novaLoc) {
        if (novaLoc.length < 3) {
            alert("A localização deve ter no mínimo 3 caracteres.");
            return;
        }

        const locOcupada = getEstandes().some(e =>
            e.localizacao.toLowerCase() === novaLoc.toLowerCase() &&
            e.projeto_id !== projetoIdEmEdicao
        );
        if (locOcupada) {
            alert("Já existe um estande com esta localização.");
            return;
        }

        let estandes = getEstandes();
        const idx    = estandes.findIndex(e => e.projeto_id === projetoIdEmEdicao);
        if (idx !== -1) {
            estandes[idx].localizacao = novaLoc;
        } else {
            estandes.push({ id: Date.now(), localizacao: novaLoc, projeto_id: projetoIdEmEdicao });
        }
        salvarEstandes(estandes);
    }

    if (novaDataHora) {
        const agora = new Date();
        if (new Date(novaDataHora) <= agora) {
            alert("Não é permitido agendar datas no passado.");
            return;
        }

        const conflito = getHorarios().some(h =>
            h.data_hora === novaDataHora && h.projeto_id !== projetoIdEmEdicao
        );
        if (conflito) {
            alert("Já existe uma apresentação marcada para este horário.");
            return;
        }

        let horarios = getHorarios();
        const idx    = horarios.findIndex(h => h.projeto_id === projetoIdEmEdicao);
        if (idx !== -1) {
            horarios[idx].data_hora = novaDataHora;
        } else {
            horarios.push({ id: Date.now(), data_hora: novaDataHora, projeto_id: projetoIdEmEdicao });
        }
        salvarHorarios(horarios);
    }

    fecharForms();
    listarTudo();
});

function carregarProjetosDisponiveis(tipo, projetoAtualId = null) {
    const projetos = getProjetos();
    const vinculos = tipo === 'estande' ? getEstandes() : getHorarios();
    const selectId = tipo === 'estande' ? "projeto_id_estande" : "projeto_id_horario";
    const select   = document.getElementById(selectId);
    const ocupados = vinculos.map(v => v.projeto_id);

    select.innerHTML = '<option value="">Selecione um projeto</option>';
    projetos.forEach(p => {
        if (!ocupados.includes(p.id) || p.id === projetoAtualId) {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.titulo;
            if (p.id === projetoAtualId) opt.selected = true;
            select.appendChild(opt);
        }
    });
}

document.getElementById("formEstande").addEventListener("submit", (e) => {
    e.preventDefault();
    const loc      = document.getElementById("localizacao").value.trim();
    const projId   = Number(document.getElementById("projeto_id_estande").value);

    if (loc.length < 3) { alert("A localização deve ter no mínimo 3 caracteres."); return; }

    const locOcupada = getEstandes().some(es => es.localizacao.toLowerCase() === loc.toLowerCase());
    if (locOcupada) { alert("Já existe um estande com esta localização."); return; }

    let estandes = getEstandes();
    estandes.push({ id: Date.now(), localizacao: loc, projeto_id: projId });
    salvarEstandes(estandes);
    fecharForms();
    listarTudo();
});

document.getElementById("formHorario").addEventListener("submit", (e) => {
    e.preventDefault();
    const dataHora = document.getElementById("data_hora").value;
    const projId   = Number(document.getElementById("projeto_id_horario").value);

    if (new Date(dataHora) <= new Date()) { alert("Não é permitido agendar datas no passado."); return; }

    const conflito = getHorarios().some(h => h.data_hora === dataHora);
    if (conflito) { alert("Já existe uma apresentação marcada para este horário."); return; }

    let horarios = getHorarios();
    horarios.push({ id: Date.now(), data_hora: dataHora, projeto_id: projId });
    salvarHorarios(horarios);
    fecharForms();
    listarTudo();
});

function abrirFormEstande() {
    fecharForms();
    carregarProjetosDisponiveis('estande');
    document.getElementById("formEstandeSection").style.display = "block";
    document.getElementById("formEstandeSection").scrollIntoView({ behavior: "smooth" });
}

function abrirFormHorario() {
    fecharForms();
    carregarProjetosDisponiveis('horario');
    document.getElementById("formHorarioSection").style.display = "block";
    document.getElementById("formHorarioSection").scrollIntoView({ behavior: "smooth" });
}

function fecharForms() {
    projetoIdEmEdicao = null;
    document.getElementById("formEdicaoSection").style.display  = "none";
    document.getElementById("formEstandeSection").style.display = "none";
    document.getElementById("formHorarioSection").style.display = "none";
    document.getElementById("formEdicao").reset();
    document.getElementById("formEstande").reset();
    document.getElementById("formHorario").reset();
}

function excluirItem(projetoId) {
    const proj = getProjetos().find(p => p.id === projetoId);
    const nome = proj ? proj.titulo : "este projeto";
    if (confirm(`Deseja remover os vínculos de estande e horário de "${nome}"?`)) {
        salvarEstandes(getEstandes().filter(e => e.projeto_id !== projetoId));
        salvarHorarios(getHorarios().filter(h => h.projeto_id !== projetoId));
        listarTudo();
    }
}

document.addEventListener("DOMContentLoaded", listarTudo);
document.getElementById("busca").addEventListener("input", listarTudo);