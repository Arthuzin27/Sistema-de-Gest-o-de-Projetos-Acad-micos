function voltar() {
    window.history.back();
}

function get(chave) {
 return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvar(chave, lista) {
 localStorage.setItem(chave, JSON.stringify(lista));
}

function gerarId() {
 return Date.now();
}

function escapeHtml(texto) {
 if (!texto) return "";
 const div = document.createElement("div");
 div.textContent = texto;
 return div.innerHTML;
}

let abaAtiva = 'avaliadores';

function trocarAba(aba) {
 abaAtiva = aba;

 document.getElementById('secao-avaliadores').style.display = aba === 'avaliadores' ? 'block' : 'none';
 document.getElementById('secao-avaliacoes').style.display  = aba === 'avaliacoes'  ? 'block' : 'none';

 document.querySelectorAll('.aba').forEach(btn => {
     btn.classList.toggle('ativa', btn.textContent.toLowerCase().includes(
         aba === 'avaliadores' ? 'avaliador' : 'avaliação'
     ));
 });

 const placeholders = {
     avaliadores: 'Buscar por nome...',
     avaliacoes:  'Buscar por projeto ou avaliador...'
 };
 document.getElementById('busca').placeholder = placeholders[aba];
 document.getElementById('busca').value = '';

 cancelarFormulario();
 listar();
}

function listar() {
 if (abaAtiva === 'avaliadores') listarAvaliadores();
 else listarAvaliacoes();
}

function abrirFormulario() {
 if (abaAtiva === 'avaliadores') abrirFormAvaliador();
 else abrirFormAvaliacao();
}

function cancelarFormulario() {
 document.getElementById('formSectionAvaliador').style.display = 'none';
 document.getElementById('formSectionAvaliacao').style.display = 'none';
 document.getElementById('formAvaliador').reset();
 document.getElementById('formAvaliacao').reset();
 document.getElementById('avaliadorId').value = '';
 document.getElementById('avaliacaoId').value = '';
}

let itemParaExcluir = null;
let tipoParaExcluir = null;

function abrirModal(id, nome, tipo) {
 itemParaExcluir = id;
 tipoParaExcluir = tipo;
 document.getElementById('modalNomeItem').textContent = nome;
 document.getElementById('modalExclusao').style.display = 'flex';
}

function fecharModal() {
 itemParaExcluir = null;
 tipoParaExcluir = null;
 document.getElementById('modalExclusao').style.display = 'none';
}

function confirmarExclusao() {
 if (!itemParaExcluir) return;
 if (tipoParaExcluir === 'avaliador') excluirAvaliador(itemParaExcluir);
 else excluirAvaliacao(itemParaExcluir);
 fecharModal();
}

window.onclick = function(event) {
 const modal = document.getElementById('modalExclusao');
 if (event.target === modal) fecharModal();
};

function listarAvaliadores() {
 const busca = document.getElementById('busca').value.toLowerCase();
 let lista = get('avaliadores');
 const tbody = document.getElementById('tabelaAvaliadores');
 tbody.innerHTML = '';

 if (busca) {
     lista = lista.filter(a =>
         a.nome.toLowerCase().includes(busca) ||
         a.email.toLowerCase().includes(busca)
     );
 }

 if (lista.length === 0) {
     tbody.innerHTML = `
         <tr class="mensagem-vazia">
             <td colspan="4">Nenhum avaliador externo cadastrado ainda. Clique em "+ Novo Cadastro" para começar.</td>
         </tr>`;
     return;
 }

 lista.forEach(a => {
     tbody.innerHTML += `
         <tr>
             <td><strong>${escapeHtml(a.nome)}</strong></td>
             <td>${escapeHtml(a.email)}</td>
             <td>${escapeHtml(a.instituicao)}</td>
             <td class="action-buttons">
                 <button onclick="editarAvaliador(${a.id})">Editar</button>
                 <button onclick="abrirModal(${a.id}, '${escapeHtml(a.nome)}', 'avaliador')">Excluir</button>
             </td>
         </tr>`;
 });
}

function abrirFormAvaliador() {
 document.getElementById('tituloFormAvaliador').textContent = 'Novo Avaliador Externo';
 document.getElementById('avaliadorId').value = '';
 document.getElementById('formAvaliador').reset();
 document.getElementById('formSectionAvaliador').style.display = 'block';
 document.getElementById('formSectionAvaliador').scrollIntoView({ behavior: 'smooth' });
}

function editarAvaliador(id) {
 const lista = get('avaliadores');
 const a = lista.find(a => a.id === id);
 if (!a) return;

 document.getElementById('tituloFormAvaliador').textContent = 'Editar Avaliador Externo';
 document.getElementById('avaliadorId').value = a.id;
 document.getElementById('avaliadorNome').value = a.nome;
 document.getElementById('avaliadorEmail').value = a.email;
 document.getElementById('avaliadorSenha').value = '';
 document.getElementById('avaliadorInstituicao').value = a.instituicao;
 document.getElementById('formSectionAvaliador').style.display = 'block';
 document.getElementById('formSectionAvaliador').scrollIntoView({ behavior: 'smooth' });
}

function salvarAvaliador(e) {
 e.preventDefault();

 const id          = document.getElementById('avaliadorId').value;
 const nome        = document.getElementById('avaliadorNome').value.trim();
 const email       = document.getElementById('avaliadorEmail').value.trim();
 const senha       = document.getElementById('avaliadorSenha').value;
 const instituicao = document.getElementById('avaliadorInstituicao').value.trim();

 if (nome.length < 3) {
     alert('Nome deve ter no mínimo 3 caracteres.');
     return;
 }

 if (!email.includes('@') || !email.includes('.')) {
     alert('Email inválido. Deve conter @ e um domínio válido.');
     return;
 }

 if (!id && senha.length < 6) {
     alert('Senha deve ter no mínimo 6 caracteres.');
     return;
 }

 if (instituicao.length < 3) {
     alert('Instituição deve ter no mínimo 3 caracteres.');
     return;
 }

 let lista = get('avaliadores');

 if (lista.some(a => a.email === email && a.id != id)) {
     alert('Este email já está cadastrado.');
     return;
 }

 const professores = get('professores');
 if (professores.some(p => p.email === email)) {
     alert('Este email já está cadastrado por um professor ou coordenador.');
     return;
 }

 if (id) {
     lista = lista.map(a => a.id == id ? {
         ...a,
         nome,
         email,
         senha: senha || a.senha,
         instituicao,
         tipo: 'avaliador_externo'
     } : a);
     alert('Avaliador atualizado com sucesso!');
 } else {
     lista.push({
         id: gerarId(),
         nome,
         email,
         senha,
         instituicao,
         tipo: 'avaliador_externo'
     });
     alert('Avaliador cadastrado com sucesso!');
 }

 salvar('avaliadores', lista);
 cancelarFormulario();
 listarAvaliadores();
}

function excluirAvaliador(id) {
 const avaliacoes = get('avaliacoes');
 if (avaliacoes.some(av => av.avaliador_id == id && av.tipo_avaliador === 'externo')) {
     alert('Não é possível excluir: este avaliador possui avaliações vinculadas.');
     return;
 }

 let lista = get('avaliadores');
 lista = lista.filter(a => a.id !== id);
 salvar('avaliadores', lista);
 listarAvaliadores();
 alert('Avaliador excluído com sucesso!');
}

// =============================================

function listarAvaliacoes() {
 const busca = document.getElementById('busca').value.toLowerCase();
 let lista = get('avaliacoes');
 const projetos    = get('projetos');
 const professores = get('professores');
 const avaliadores = get('avaliadores');
 const tbody = document.getElementById('tabelaAvaliacoes');
 tbody.innerHTML = '';

 if (busca) {
     lista = lista.filter(av => {
         const proj = projetos.find(p => p.id == av.projeto_id);
         const aval = av.tipo_avaliador === 'professor'
             ? professores.find(p => p.id == av.avaliador_id)
             : avaliadores.find(a => a.id == av.avaliador_id);
         return (proj  && proj.titulo.toLowerCase().includes(busca)) ||
                (aval  && aval.nome.toLowerCase().includes(busca));
     });
 }

 if (lista.length === 0) {
     tbody.innerHTML = `
         <tr class="mensagem-vazia">
             <td colspan="5">Nenhuma avaliação cadastrada ainda. Clique em "+ Novo Cadastro" para começar.</td>
         </tr>`;
     return;
 }

 lista.forEach(av => {
     const proj = projetos.find(p => p.id == av.projeto_id);

     let aval, badge;
     if (av.tipo_avaliador === 'professor') {
         aval  = professores.find(p => p.id == av.avaliador_id);
         badge = `<span class="badge-avaliador">Professor</span>`;
     } else {
         aval  = avaliadores.find(a => a.id == av.avaliador_id);
         badge = `<span class="badge-externo">Externo</span>`;
     }

     const comentario = av.comentario
         ? (av.comentario.length > 50 ? av.comentario.substring(0, 50) + '...' : av.comentario)
         : '—';

     tbody.innerHTML += `
         <tr>
             <td><strong>${escapeHtml(proj ? proj.titulo : '—')}</strong></td>
             <td>${escapeHtml(aval ? aval.nome : '—')} ${badge}</td>
             <td><span class="badge-nota">${av.nota}</span></td>
             <td>${escapeHtml(comentario)}</td>
             <td class="action-buttons">
                 <button onclick="editarAvaliacao(${av.id})">Editar</button>
                 <button onclick="abrirModal(${av.id}, 'esta avaliação', 'avaliacao')">Excluir</button>
             </td>
         </tr>`;
 });
}

function preencherSelectProjetos(selecionado = '') {
 const projetos = get('projetos');
 const select = document.getElementById('avaliacaoProjeto');
 select.innerHTML = '<option value="">Selecione um projeto</option>';
 if (projetos.length === 0) {
     select.innerHTML += '<option disabled>Nenhum projeto cadastrado</option>';
     return;
 }
 projetos.forEach(p => {
     select.innerHTML += `<option value="${p.id}" ${p.id == selecionado ? 'selected' : ''}>${escapeHtml(p.titulo)}</option>`;
 });
}

function preencherSelectAvaliadores(selecionado = '', tipoSelecionado = '') {
 const professores = get('professores');
 const avaliadores = get('avaliadores');
 const select = document.getElementById('avaliacaoAvaliador');
 select.innerHTML = '<option value="">Selecione um avaliador</option>';

 if (professores.length > 0) {
     const grupo = document.createElement('optgroup');
     grupo.label = 'Professores';
     professores.filter(p => p.tipo === 'professor').forEach(p => {
         const opt = document.createElement('option');
         opt.value = p.id;
         opt.dataset.tipo = 'professor';
         opt.textContent = p.nome;
         opt.selected = (p.id == selecionado && tipoSelecionado === 'professor');
         grupo.appendChild(opt);
     });
     select.appendChild(grupo);
 }

 if (avaliadores.length > 0) {
     const grupo = document.createElement('optgroup');
     grupo.label = 'Avaliadores Externos';
     avaliadores.forEach(a => {
         const opt = document.createElement('option');
         opt.value = a.id;
         opt.dataset.tipo = 'externo';
         opt.textContent = a.nome;
         opt.selected = (a.id == selecionado && tipoSelecionado === 'externo');
         grupo.appendChild(opt);
     });
     select.appendChild(grupo);
 }
}

function abrirFormAvaliacao() {
 document.getElementById('tituloFormAvaliacao').textContent = 'Nova Avaliação';
 document.getElementById('avaliacaoId').value = '';
 document.getElementById('formAvaliacao').reset();
 preencherSelectProjetos();
 preencherSelectAvaliadores();
 document.getElementById('formSectionAvaliacao').style.display = 'block';
 document.getElementById('formSectionAvaliacao').scrollIntoView({ behavior: 'smooth' });
}

function editarAvaliacao(id) {
 const lista = get('avaliacoes');
 const av = lista.find(a => a.id === id);
 if (!av) return;

 document.getElementById('tituloFormAvaliacao').textContent = 'Editar Avaliação';
 document.getElementById('avaliacaoId').value = av.id;
 preencherSelectProjetos(av.projeto_id);
 preencherSelectAvaliadores(av.avaliador_id, av.tipo_avaliador);
 document.getElementById('avaliacaoNota').value = av.nota;
 document.getElementById('avaliacaoComentario').value = av.comentario || '';
 document.getElementById('formSectionAvaliacao').style.display = 'block';
 document.getElementById('formSectionAvaliacao').scrollIntoView({ behavior: 'smooth' });
}

function salvarAvaliacao(e) {
 e.preventDefault();

 const id         = document.getElementById('avaliacaoId').value;
 const projeto_id = document.getElementById('avaliacaoProjeto').value;
 const nota       = parseFloat(document.getElementById('avaliacaoNota').value);
 const comentario = document.getElementById('avaliacaoComentario').value.trim();

 const selectAv   = document.getElementById('avaliacaoAvaliador');
 const avaliador_id = selectAv.value;
 const tipo_avaliador = selectAv.selectedOptions[0]?.dataset?.tipo || '';

 if (!projeto_id) {
     alert('Selecione um projeto.');
     return;
 }

 if (!avaliador_id) {
     alert('Selecione um avaliador.');
     return;
 }

 if (isNaN(nota) || nota < 0 || nota > 10) {
     alert('Nota deve ser um número entre 0 e 10.');
     return;
 }

 if (comentario.length > 500) {
     alert('Comentário deve ter no máximo 500 caracteres.');
     return;
 }

 let lista = get('avaliacoes');

 const duplicado = lista.find(av =>
     av.projeto_id == projeto_id &&
     av.avaliador_id == avaliador_id &&
     av.tipo_avaliador === tipo_avaliador &&
     av.id != id
 );
 if (duplicado) {
     alert('Este avaliador já avaliou este projeto.');
     return;
 }

 if (id) {
     lista = lista.map(av => av.id == id ? {
         ...av,
         projeto_id,
         avaliador_id,
         tipo_avaliador,
         nota,
         comentario
     } : av);
     alert('Avaliação atualizada com sucesso!');
 } else {
     lista.push({
         id: gerarId(),
         projeto_id,
         avaliador_id,
         tipo_avaliador,
         nota,
         comentario
     });
     alert('Avaliação cadastrada com sucesso!');
 }

 salvar('avaliacoes', lista);
 cancelarFormulario();
 listarAvaliacoes();
}

function excluirAvaliacao(id) {
 let lista = get('avaliacoes');
 lista = lista.filter(av => av.id !== id);
 salvar('avaliacoes', lista);
 listarAvaliacoes();
 alert('Avaliação excluída com sucesso!');
}

document.addEventListener('DOMContentLoaded', function () {
 document.getElementById('btnBuscar').addEventListener('click', listar);

 document.getElementById('busca').addEventListener('keypress', function (e) {
     if (e.key === 'Enter') listar();
 });

 document.getElementById('formAvaliador').addEventListener('submit', salvarAvaliador);
 document.getElementById('formAvaliacao').addEventListener('submit', salvarAvaliacao);

 listar();
});