function voltarPagina() {
    window.history.back();
}

function getProfessores() {
    return JSON.parse(localStorage.getItem("professores")) || [];
}

function salvarProfessores(lista) {
    localStorage.setItem("professores", JSON.stringify(lista));
}

function gerarId() {
    return Date.now();
}

function carregarCursos() {
    const cursos = JSON.parse(localStorage.getItem("cursos")) || [];
    const select = document.getElementById("curso");

    if (!select) return;

    select.innerHTML = '<option value="">Selecione um curso</option>';

    cursos.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
    });
}

function listar() {
    const busca = document.getElementById("busca")?.value.toLowerCase() || "";
    let lista = getProfessores();
    const tbody = document.getElementById("tabelaProfessores");
    tbody.innerHTML = "";

    if (busca) {
        lista = lista.filter(p => 
            p.nome.toLowerCase().includes(busca) || 
            p.siape.includes(busca)
        );
    }

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr class="mensagem-vazia">
                <td colspan="5">Nenhum professor ou coordenador cadastrado ainda. Clique em "+ Novo Cadastro" para começar.</td>
            </tr>
        `;
        return;
    }

    lista.forEach(p => {
        const tipoBadge = p.tipo === 'professor' 
            ? '<span class="badge-professor">Professor</span>' 
            : '<span class="badge-coordenador">Coordenador</span>';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${p.nome}</strong></td>
                <td>${p.email}</td>
                <td>${p.siape}</td>
                <td>${tipoBadge}</td>
                <td>
                    <button onclick="editar(${p.id})">Editar</button>
                    <button onclick="excluir(${p.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function controlarCampoCurso() {
    const tipo = document.getElementById("tipo").value;
    const cursoContainer = document.getElementById("cursoContainer");
    const cursoSelect = document.getElementById("curso");
    
    if (tipo === "coordenador") {
        cursoContainer.style.display = "block";
        cursoSelect.required = true;
    } else {
        cursoContainer.style.display = "none";
        cursoSelect.required = false;
        cursoSelect.value = "";
    }
}

function professorTemVinculos(id) {

    const gruposMock = JSON.parse(localStorage.getItem("grupos")) || [];
    const avaliacoesMock = JSON.parse(localStorage.getItem("avaliacoes")) || [];
    
    const ehOrientador = gruposMock.some(g => g.orientador_id == id);
    const temAvaliacao = avaliacoesMock.some(a => a.avaliador_id == id);
    
    return ehOrientador || temAvaliacao;
}

function coordenadorTemVinculos(id) {

    const cursosMock = JSON.parse(localStorage.getItem("cursos")) || [];
    
    return cursosMock.some(c => c.coordenador_id == id);
}

function salvar() {
    const id = document.getElementById("id").value;
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const siape = document.getElementById("siape").value.trim();
    const tipo = document.getElementById("tipo").value;
    const curso = document.getElementById("curso").value;

    let lista = getProfessores();


    if (nome.length < 3) {
        alert("Nome deve ter no mínimo 3 caracteres.");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Email inválido. Deve conter @ e um domínio válido.");
        return;
    }

    if (!id && senha.length < 6) {
        alert("Senha deve ter no mínimo 6 caracteres.");
        return;
    }

    if (siape.length === 0) {
        alert("SIAPE é obrigatório.");
        return;
    }

    if (lista.some(p => p.email === email && p.id != id)) {
        alert("Este email já está cadastrado.");
        return;
    }

    if (lista.some(p => p.siape === siape && p.id != id)) {
        alert("Este SIAPE já está cadastrado.");
        return;
    }

    if (tipo === "coordenador" && !curso) {
        alert("Coordenador deve ter um curso vinculado.");
        return;
    }

    if (id) {
        lista = lista.map(p => p.id == id ? { 
            id: Number(id), 
            nome, 
            email, 
            senha: senha || p.senha,
            siape, 
            tipo, 
            curso: tipo === "coordenador" ? curso : null 
        } : p);
        alert("Registro atualizado com sucesso!");
    } else {
        lista.push({
            id: gerarId(),
            nome,
            email,
            senha,
            siape,
            tipo,
            curso: tipo === "coordenador" ? curso : null
        });
        alert("Cadastro realizado com sucesso!");
    }

    salvarProfessores(lista);
    cancelarFormulario();
    listar();
}

function editar(id) {
    const lista = getProfessores();
    const p = lista.find(p => p.id === id);

    if (!p) return;

    document.getElementById("id").value = p.id;
    document.getElementById("nome").value = p.nome;
    document.getElementById("email").value = p.email;
    document.getElementById("senha").value = "";
    document.getElementById("siape").value = p.siape;
    document.getElementById("tipo").value = p.tipo;
    document.getElementById("curso").value = p.curso || "";
    
    document.getElementById("formSection").style.display = "block";
    controlarCampoCurso();
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

function excluir(id) {
    const lista = getProfessores();
    const pessoa = lista.find(p => p.id === id);
    
    if (!pessoa) return;
    
    if (pessoa.tipo === "professor" && professorTemVinculos(id)) {
        alert("Não é possível excluir este professor. Ele está vinculado a grupos ou avaliações.");
        return;
    }
    
    if (pessoa.tipo === "coordenador" && coordenadorTemVinculos(id)) {
        alert("Não é possível excluir este coordenador. Ele está vinculado a um curso.");
        return;
    }
    
    if (!confirm(`Deseja realmente excluir ${pessoa.nome}?`)) return;

    const novaLista = lista.filter(p => p.id !== id);
    salvarProfessores(novaLista);
    listar();
    alert("Registro excluído com sucesso!");
}

function abrirFormulario() {
    document.getElementById("formProfessor").reset();
    document.getElementById("id").value = "";
    document.getElementById("formSection").style.display = "block";
    controlarCampoCurso();
    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
}

function cancelarFormulario() {
    document.getElementById("formProfessor").reset();
    document.getElementById("id").value = "";
}

document.addEventListener("DOMContentLoaded", function() {
    const btnBuscar = document.getElementById("btnBuscar");
    if (btnBuscar) {
        btnBuscar.addEventListener("click", listar);
    }
    
    const buscaInput = document.getElementById("busca");
    if (buscaInput) {
        buscaInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                listar();
            }
        });
    }
    
    const form = document.getElementById("formProfessor");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            salvar();
        });
    }
    
    const tipoSelect = document.getElementById("tipo");
    if (tipoSelect) {
        tipoSelect.addEventListener("change", controlarCampoCurso);
    }
    
    controlarCampoCurso();
    carregarCursos();
    listar();
});