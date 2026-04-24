function voltarPagina() {
    window.history.back();
}

function getGrupos() {
    return JSON.parse(localStorage.getItem("grupos")) || [];
}

function salvarGrupos(lista) {
    localStorage.setItem("grupos", JSON.stringify(lista));
}

function getTurmas() {
    return JSON.parse(localStorage.getItem("turmas")) || [];
}

function getCursos() {
    return JSON.parse(localStorage.getItem("cursos")) || [];
}

function getPeriodos() {
    return JSON.parse(localStorage.getItem("periodos")) || [];
}

function getProfessores() {
    const todos = JSON.parse(localStorage.getItem("professores")) || [];
    return todos.filter(p => p.tipo === "professor");
}

function getAlunos() {
    return JSON.parse(localStorage.getItem("alunos")) || [];
}

function gerarId() {
    return Date.now().toString();
}

function nomeTurma(turmaId) {
    const turmas  = getTurmas();
    const cursos  = getCursos();
    const periodos = getPeriodos();
    const turma   = turmas.find(t => t.id == turmaId);
    if (!turma) return `Turma #${turmaId}`;
    const curso   = cursos.find(c => c.id == turma.curso_id);
    const periodo = periodos.find(p => p.id == turma.periodo_id);
    const nomeCurso = curso ? curso.nome : `Curso #${turma.curso_id}`;
    const labelPeriodo = periodo ? `${periodo.ano}/${periodo.semestre}` : `Período #${turma.periodo_id}`;
    return `${nomeCurso} — ${labelPeriodo}`;
}

function nomeOrientador(professorId) {
    const profs = getProfessores();
    const prof  = profs.find(p => p.id == professorId);
    return prof ? prof.nome : `Professor #${professorId}`;
}

function listar() {
    const filtraTurma = document.getElementById("filtraTurma")?.value || "";
    let lista = getGrupos();
    const tbody = document.getElementById("tabelaGrupos");
    tbody.innerHTML = "";

    if (filtraTurma) {
        lista = lista.filter(g => g.turma_id == filtraTurma);
    }

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr class="mensagem-vazia">
                <td colspan="4">Nenhum grupo cadastrado${filtraTurma ? " para esta turma" : ""}. Clique em "+ Novo Grupo" para começar.</td>
            </tr>
        `;
        return;
    }

    lista.forEach(g => {
        const qtdAlunos = Array.isArray(g.alunos) ? g.alunos.length : 0;

        tbody.innerHTML += `
            <tr>
                <td>${nomeTurma(g.turma_id)}</td>
                <td>${nomeOrientador(g.orientador_id)}</td>
                <td>${qtdAlunos} aluno(s)</td>
                <td>
                    <button onclick="editar('${g.id}')">Editar</button>
                    <button onclick="excluir('${g.id}')">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function carregarFiltroTurmas() {
    const turmas  = getTurmas();
    const cursos  = getCursos();
    const periodos = getPeriodos();
    const select  = document.getElementById("filtraTurma");
    const valorAtual = select.value;

    select.innerHTML = `<option value="">Filtrar por turma...</option>`;
    turmas.forEach(t => {
        const curso = cursos.find(c => c.id == t.curso_id);
        const periodo = periodos.find(p => p.id == t.periodo_id);
        const label = `${curso ? curso.nome : "Curso"} — ${periodo ? `${periodo.ano}/${periodo.semestre}` : `Período #${t.periodo_id}`}`;
        select.innerHTML += `<option value="${t.id}">${label}</option>`;
    });

    if (valorAtual) select.value = valorAtual;
}

function carregarTurmasForm() {
    const turmas = getTurmas();
    const cursos = getCursos();
    const periodos = getPeriodos();
    const select = document.getElementById("turma_id");
    const valorAtual = select.value;

    select.innerHTML = `<option value="">Selecione uma turma</option>`;
    turmas.forEach(t => {
        const curso  = cursos.find(c => c.id == t.curso_id);
        const periodo = periodos.find(p => p.id == t.periodo_id);
        const label  = `${curso ? curso.nome : "Curso"} — ${periodo ? `${periodo.ano}/${periodo.semestre}` : `Período #${t.periodo_id}`}`;
        select.innerHTML += `<option value="${t.id}">${label}</option>`;
    });

    if (valorAtual) select.value = valorAtual;
}

function carregarProfessoresForm() {
    const profs  = getProfessores();
    const select = document.getElementById("orientador_id");
    const valorAtual = select.value;

    select.innerHTML = `<option value="">Selecione um professor</option>`;
    profs.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
    });

    if (valorAtual) select.value = valorAtual;
}

function carregarAlunosDaTurma(turmaId, selecionados = []) {
    const container = document.getElementById("alunosContainer");
    container.innerHTML = "";

    if (!turmaId) {
        container.innerHTML = `<p class="hint-selecione">Selecione uma turma para ver os alunos disponíveis.</p>`;
        return;
    }

    const grupos        = getGrupos();
    const grupoAtualId  = document.getElementById("id").value;

    // Alunos já alocados em outros grupos da mesma turma
    const alunosOcupados = new Set();
    grupos.forEach(g => {
        if (g.turma_id != turmaId) return;
        if (g.id === grupoAtualId) return;
        if (Array.isArray(g.alunos)) g.alunos.forEach(a => alunosOcupados.add(a));
    });

    const alunosDaTurma = getAlunos().filter(a => a.turma_id == turmaId);

    if (alunosDaTurma.length === 0) {
        container.innerHTML = `<p class="sem-alunos">Nenhum aluno cadastrado nesta turma.</p>`;
        return;
    }

    alunosDaTurma.forEach(a => {
        const ocupado   = alunosOcupados.has(a.id);
        const marcado   = selecionados.includes(a.id);
        const disabled  = ocupado && !marcado ? "disabled" : "";
        const label     = ocupado && !marcado ? `${a.nome} (já em outro grupo)` : a.nome;

        container.innerHTML += `
            <div class="aluno-check">
                <input type="checkbox"
                    id="aluno_${a.id}"
                    value="${a.id}"
                    ${marcado ? "checked" : ""}
                    ${disabled}>
                <label for="aluno_${a.id}">${label}</label>
            </div>
        `;
    });
}

function getAlunosSelecionados() {
    return Array.from(
        document.querySelectorAll("#alunosContainer input[type='checkbox']:checked")
    ).map(cb => cb.value);
}

function validarGrupo(dados, idAtual) {
    if (!dados.turma_id) {
        alert("Selecione uma turma.");
        return false;
    }

    if (!dados.orientador_id) {
        alert("Selecione um professor orientador.");
        return false;
    }

    if (dados.alunos.length < 2 || dados.alunos.length > 6) {
        alert("O grupo deve ter entre 2 e 6 alunos.");
        return false;
    }

    return true;
}

function salvar() {
    const id = document.getElementById("id").value;
    const dados = {
        turma_id:     document.getElementById("turma_id").value,
        orientador_id: document.getElementById("orientador_id").value,
        alunos:       getAlunosSelecionados(),
    };

    if (!validarGrupo(dados, id || null)) return;

    let lista = getGrupos();

    if (id) {
        lista = lista.map(g => {
            if (g.id !== id) return g;
            return { ...g, turma_id: dados.turma_id, orientador_id: dados.orientador_id, alunos: dados.alunos };
        });
        alert("Grupo atualizado com sucesso!");
    } else {
        lista.push({
            id:           gerarId(),
            turma_id:     dados.turma_id,
            orientador_id: dados.orientador_id,
            alunos:       dados.alunos,
        });
        alert("Grupo cadastrado com sucesso!");
    }

    salvarGrupos(lista);
    cancelarFormulario();
    listar();
}

function editar(id) {
    const grupo = getGrupos().find(g => g.id === id);
    if (!grupo) return;

    document.getElementById("id").value = grupo.id;
    document.getElementById("tituloForm").textContent = "Editar Grupo";

    carregarTurmasForm();
    carregarProfessoresForm();

    document.getElementById("turma_id").value      = grupo.turma_id;
    document.getElementById("orientador_id").value = grupo.orientador_id;

    carregarAlunosDaTurma(grupo.turma_id, grupo.alunos || []);

    document.getElementById("formSection").style.display = "block";
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

function grupoTemProjeto(id) {
    const projetos = JSON.parse(localStorage.getItem("projetos")) || [];
    return projetos.some(p => p.grupo_id == id);
}

function excluir(id) {
    const lista = getGrupos();
    const grupo = lista.find(g => g.id === id);
    if (!grupo) return;

    if (grupoTemProjeto(id)) {
        alert("Não é possível excluir este grupo. Ele possui um projeto vinculado.");
        return;
    }

    if (!confirm("Deseja realmente excluir este grupo de projeto?")) return;

    salvarGrupos(lista.filter(g => g.id !== id));
    listar();
    alert("Grupo excluído com sucesso!");
}

function abrirFormulario() {
    document.getElementById("formGrupo").reset();
    document.getElementById("id").value = "";
    document.getElementById("tituloForm").textContent = "Novo Grupo";
    carregarTurmasForm();
    carregarProfessoresForm();
    carregarAlunosDaTurma("");
    document.getElementById("formSection").style.display = "block";
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

function cancelarFormulario() {
    document.getElementById("formGrupo").reset();
    document.getElementById("id").value = "";
    document.getElementById("tituloForm").textContent = "Novo Grupo";
    carregarAlunosDaTurma("");
    document.getElementById("formSection").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btnFiltrar").addEventListener("click", listar);

    document.getElementById("formGrupo").addEventListener("submit", function (e) {
        e.preventDefault();
        salvar();
    });

    document.getElementById("turma_id").addEventListener("change", function () {
        carregarAlunosDaTurma(this.value);
    });

    carregarFiltroTurmas();
    listar();
});
