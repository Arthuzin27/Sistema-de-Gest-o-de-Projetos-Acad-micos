function voltar() {
    window.history.back();
}

function getAlunos() {
    return JSON.parse(localStorage.getItem("alunos")) || [];
}

function salvarAlunos(lista) {
    localStorage.setItem("alunos", JSON.stringify(lista));
}

function getCursos() {
    return JSON.parse(localStorage.getItem("cursos")) || [];
}

function getTurmas() {
    return JSON.parse(localStorage.getItem("turmas")) || [];
}

function getPeriodos() {
    return JSON.parse(localStorage.getItem("periodos")) || [];
}

function gerarId() {
    return Date.now().toString();
}

function listar() {
    const busca = document.getElementById("busca")?.value.toLowerCase() || "";
    let lista = getAlunos();
    const tbody = document.getElementById("tabelaAlunos");
    tbody.innerHTML = "";

    if (busca) {
        lista = lista.filter(a =>
            a.nome.toLowerCase().includes(busca) ||
            a.matricula.toLowerCase().includes(busca)
        );
    }

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr class="mensagem-vazia">
                <td colspan="6">Nenhum aluno cadastrado ainda. Clique em "+ Novo Cadastro" para começar.</td>
            </tr>
        `;
        return;
    }

    const cursos = getCursos();
    const turmas = getTurmas();
    const periodos = getPeriodos();

    lista.forEach(a => {
        const curso = cursos.find(c => c.id == a.curso_id);
        const turma = turmas.find(t => t.id == a.turma_id);
        const periodo = turma ? periodos.find(p => p.id == turma.periodo_id) : null;

        const nomeCurso = curso ? curso.nome : `Curso #${a.curso_id}`;
        const nomeTurma = periodo ? `${periodo.ano}/${periodo.semestre}` : (turma ? `Turma #${turma.id}` : `Turma #${a.turma_id}`);

        tbody.innerHTML += `
            <tr>
                <td><strong>${a.nome}</strong></td>
                <td>${a.email}</td>
                <td>${a.matricula}</td>
                <td>${nomeCurso}</td>
                <td>${nomeTurma}</td>
                <td>
                    <button onclick="editar('${a.id}')">Editar</button>
                    <button onclick="excluir('${a.id}')">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// ===================== CARREGAMENTO DE SELECTS =====================

function carregarCursos() {
    const cursos = getCursos();
    const select = document.getElementById("curso_id");
    const valorAtual = select.value;

    select.innerHTML = `<option value="">Selecione um curso</option>`;
    cursos.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
    });

    if (valorAtual) select.value = valorAtual;
}

function carregarTurmasPorCurso(cursoId, turmaSelecionada = "") {
    const turmas = getTurmas();
    const periodos = getPeriodos();
    const select = document.getElementById("turma_id");

    select.innerHTML = `<option value="">Selecione uma turma</option>`;

    if (!cursoId) return;

    const turmasFiltradas = turmas.filter(t => t.curso_id == cursoId);
    turmasFiltradas.forEach(t => {
        const periodo = periodos.find(p => p.id == t.periodo_id);
        const label = periodo ? `${periodo.ano}/${periodo.semestre}` : `Turma #${t.id}`;
        select.innerHTML += `<option value="${t.id}">${label}</option>`;
    });

    if (turmaSelecionada) select.value = turmaSelecionada;
}

// ===================== VALIDAÇÃO =====================

function validarAluno(dados, idAtual) {
    const lista = getAlunos();

    if (dados.nome.length < 3) {
        alert("Nome deve ter no mínimo 3 caracteres.");
        return false;
    }

    if (!dados.email.includes("@") || !dados.email.includes(".")) {
        alert("Email inválido. Deve conter @ e um domínio válido.");
        return false;
    }

    if (!idAtual && dados.senha.length < 6) {
        alert("Senha deve ter no mínimo 6 caracteres.");
        return false;
    }

    if (idAtual && dados.senha && dados.senha.length < 6) {
        alert("Senha deve ter no mínimo 6 caracteres.");
        return false;
    }

    if (!dados.matricula) {
        alert("Matrícula é obrigatória.");
        return false;
    }

    if (!dados.curso_id) {
        alert("Selecione um curso.");
        return false;
    }

    if (!dados.turma_id) {
        alert("Selecione uma turma.");
        return false;
    }

    if (lista.some(a => a.email === dados.email && a.id !== idAtual)) {
        alert("Este email já está cadastrado.");
        return false;
    }

    if (lista.some(a => a.matricula === dados.matricula && a.id !== idAtual)) {
        alert("Esta matrícula já está cadastrada.");
        return false;
    }

    return true;
}

// ===================== SALVAR =====================

function salvar() {
    const id = document.getElementById("id").value;
    const dados = {
        nome:      document.getElementById("nome").value.trim(),
        email:     document.getElementById("email").value.trim(),
        senha:     document.getElementById("senha").value,
        matricula: document.getElementById("matricula").value.trim(),
        curso_id:  document.getElementById("curso_id").value,
        turma_id:  document.getElementById("turma_id").value,
    };

    if (!validarAluno(dados, id || null)) return;

    let lista = getAlunos();

    if (id) {
        lista = lista.map(a => {
            if (a.id !== id) return a;
            return {
                ...a,
                nome:      dados.nome,
                email:     dados.email,
                senha:     dados.senha ? dados.senha : a.senha,
                matricula: dados.matricula,
                curso_id:  dados.curso_id,
                turma_id:  dados.turma_id,
            };
        });
        alert("Aluno atualizado com sucesso!");
    } else {
        lista.push({
            id:        gerarId(),
            tipo:      "aluno",
            nome:      dados.nome,
            email:     dados.email,
            senha:     dados.senha,
            matricula: dados.matricula,
            curso_id:  dados.curso_id,
            turma_id:  dados.turma_id,
        });
        alert("Aluno cadastrado com sucesso!");
    }

    salvarAlunos(lista);
    cancelarFormulario();
    listar();
}

// ===================== EDITAR =====================

function editar(id) {
    const aluno = getAlunos().find(a => a.id === id);
    if (!aluno) return;

    document.getElementById("id").value         = aluno.id;
    document.getElementById("nome").value        = aluno.nome;
    document.getElementById("email").value       = aluno.email;
    document.getElementById("senha").value       = "";
    document.getElementById("matricula").value   = aluno.matricula;

    carregarCursos();
    document.getElementById("curso_id").value = aluno.curso_id;
    carregarTurmasPorCurso(aluno.curso_id, aluno.turma_id);

    document.getElementById("tituloForm").textContent = "Editar Aluno";
    document.getElementById("formSection").style.display = "block";
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

// ===================== EXCLUIR =====================

function alunoTemGrupo(id) {
    const grupos = JSON.parse(localStorage.getItem("grupos")) || [];
    return grupos.some(g => Array.isArray(g.alunos) && g.alunos.includes(id));
}

function excluir(id) {
    const lista = getAlunos();
    const aluno = lista.find(a => a.id === id);
    if (!aluno) return;

    if (alunoTemGrupo(id)) {
        alert("Não é possível excluir este aluno. Ele está vinculado a um grupo de projeto.");
        return;
    }

    if (!confirm(`Deseja realmente excluir o aluno "${aluno.nome}"?`)) return;

    salvarAlunos(lista.filter(a => a.id !== id));
    listar();
    alert("Aluno excluído com sucesso!");
}

// ===================== FORMULÁRIO =====================

function abrirFormulario() {
    document.getElementById("formAluno").reset();
    document.getElementById("id").value = "";
    document.getElementById("tituloForm").textContent = "Novo Cadastro";
    carregarCursos();
    carregarTurmasPorCurso("");
    document.getElementById("formSection").style.display = "block";
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

function cancelarFormulario() {
    document.getElementById("formAluno").reset();
    document.getElementById("id").value = "";
    document.getElementById("tituloForm").textContent = "Novo Cadastro";
    document.getElementById("formSection").style.display = "none";
}

// ===================== INIT =====================

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btnBuscar").addEventListener("click", listar);

    document.getElementById("busca").addEventListener("keypress", function (e) {
        if (e.key === "Enter") listar();
    });

    document.getElementById("formAluno").addEventListener("submit", function (e) {
        e.preventDefault();
        salvar();
    });

    document.getElementById("curso_id").addEventListener("change", function () {
        carregarTurmasPorCurso(this.value);
    });

    carregarCursos();
    listar();
});
