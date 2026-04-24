function voltarPagina() {
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

let abaAtiva = 'cursos';

function trocarAba(aba) {
 abaAtiva = aba;

 document.getElementById('secao-cursos').style.display = aba === 'cursos' ? 'block' : 'none';
 document.getElementById('secao-periodos').style.display = aba === 'periodos' ? 'block' : 'none';
 document.getElementById('secao-turmas').style.display = aba === 'turmas' ? 'block' : 'none';

 document.querySelectorAll('.aba').forEach(btn => btn.classList.remove('ativa'));
 document.querySelectorAll('.aba').forEach(btn => {
     if (btn.textContent.toLowerCase().includes(aba === 'periodos' ? 'período' : aba)) {
         btn.classList.add('ativa');
     }
 });

 const placeholders = {
     cursos: 'Buscar por nome do curso...',
     periodos: 'Buscar por ano...',
     turmas: 'Buscar por curso ou período...'
 };
 document.getElementById('busca').placeholder = placeholders[aba];
 document.getElementById('busca').value = '';

 cancelarFormulario();
 listar();
}

function listar() {
 if (abaAtiva === 'cursos') listarCursos();
 else if (abaAtiva === 'periodos') listarPeriodos();
 else if (abaAtiva === 'turmas') listarTurmas();
}

function abrirFormulario() {
 if (abaAtiva === 'cursos') abrirFormCurso();
 else if (abaAtiva === 'periodos') abrirFormPeriodo();
 else if (abaAtiva === 'turmas') abrirFormTurma();
}

function cancelarFormulario() {
 document.getElementById('formSectionCurso').style.display = 'none';
 document.getElementById('formSectionPeriodo').style.display = 'none';
 document.getElementById('formSectionTurma').style.display = 'none';
 document.getElementById('formCurso').reset();
 document.getElementById('formPeriodo').reset();
 document.getElementById('formTurma').reset();
 document.getElementById('cursoId').value = '';
 document.getElementById('periodoId').value = '';
 document.getElementById('turmaId').value = '';
}

function listarCursos() {
 const busca = document.getElementById('busca').value.toLowerCase();
 let lista = get('cursos');
 const professores = get('professores');
 const tbody = document.getElementById('tabelaCursos');
 tbody.innerHTML = '';

 if (busca) {
     lista = lista.filter(c => c.nome.toLowerCase().includes(busca));
 }

 if (lista.length === 0) {
     tbody.innerHTML = `
         <tr class="mensagem-vazia">
             <td colspan="3">Nenhum curso cadastrado ainda. Clique em "+ Novo Cadastro" para começar.</td>
         </tr>`;
     return;
 }

 lista.forEach(curso => {
     const coord = professores.find(p => p.id == curso.coordenador_id);
     tbody.innerHTML += `
         <tr>
             <td><strong>${curso.nome}</strong></td>
             <td>${coord ? coord.nome : '—'}</td>
             <td>
                 <button onclick="editarCurso(${curso.id})">Editar</button>
                 <button onclick="excluirCurso(${curso.id})">Excluir</button>
             </td>
         </tr>`;
 });
}

function preencherSelectCoordenadores(selecionado = '') {
 const professores = get('professores');
 const coordenadores = professores.filter(p => p.tipo === 'coordenador');
 const select = document.getElementById('cursoCoordenador');
 select.innerHTML = '<option value="">Selecione um coordenador</option>';
 coordenadores.forEach(c => {
     select.innerHTML += `<option value="${c.id}" ${c.id == selecionado ? 'selected' : ''}>${c.nome}</option>`;
 });
}

function abrirFormCurso() {
 document.getElementById('tituloFormCurso').textContent = 'Novo Curso';
 document.getElementById('cursoId').value = '';
 document.getElementById('formCurso').reset();
 preencherSelectCoordenadores();
 document.getElementById('formSectionCurso').style.display = 'block';
 document.getElementById('formSectionCurso').scrollIntoView({ behavior: 'smooth' });
}

function editarCurso(id) {
 const lista = get('cursos');
 const curso = lista.find(c => c.id === id);
 if (!curso) return;

 document.getElementById('tituloFormCurso').textContent = 'Editar Curso';
 document.getElementById('cursoId').value = curso.id;
 document.getElementById('cursoNome').value = curso.nome;
 preencherSelectCoordenadores(curso.coordenador_id);
 document.getElementById('formSectionCurso').style.display = 'block';
 document.getElementById('formSectionCurso').scrollIntoView({ behavior: 'smooth' });
}

function salvarCurso(e) {
 e.preventDefault();

 const id = document.getElementById('cursoId').value;
 const nome = document.getElementById('cursoNome').value.trim();
 const coordenador_id = document.getElementById('cursoCoordenador').value;

 if (nome.length < 3) {
     alert('Nome deve ter no mínimo 3 caracteres.');
     return;
 }

 let lista = get('cursos');

 if (lista.some(c => c.nome.toLowerCase() === nome.toLowerCase() && c.id != id)) {
     alert('Já existe um curso com esse nome.');
     return;
 }

 if (id) {
     lista = lista.map(c => c.id == id ? { ...c, nome, coordenador_id } : c);
     alert('Curso atualizado com sucesso!');
 } else {
     lista.push({ id: gerarId(), nome, coordenador_id });
     alert('Curso cadastrado com sucesso!');
 }

 salvar('cursos', lista);
 cancelarFormulario();
 listarCursos();
}

function excluirCurso(id) {
 const turmas = get('turmas');
 if (turmas.some(t => t.curso_id == id)) {
     alert('Não é possível excluir: existem turmas vinculadas a este curso.');
     return;
 }

 const lista = get('cursos');
 const curso = lista.find(c => c.id === id);
 if (!confirm(`Deseja realmente excluir o curso "${curso.nome}"?`)) return;

 salvar('cursos', lista.filter(c => c.id !== id));
 listarCursos();
 alert('Curso excluído com sucesso!');
}

function listarPeriodos() {
 const busca = document.getElementById('busca').value.toLowerCase();
 let lista = get('periodos');
 const tbody = document.getElementById('tabelaPeriodos');
 tbody.innerHTML = '';

 if (busca) {
     lista = lista.filter(p => String(p.ano).includes(busca));
 }

 if (lista.length === 0) {
     tbody.innerHTML = `
         <tr class="mensagem-vazia">
             <td colspan="3">Nenhum período letivo cadastrado ainda. Clique em "+ Novo Cadastro" para começar.</td>
         </tr>`;
     return;
 }

 lista.forEach(periodo => {
     tbody.innerHTML += `
         <tr>
             <td><strong>${periodo.ano}</strong></td>
             <td>${periodo.semestre}º Semestre</td>
             <td>
                 <button onclick="editarPeriodo(${periodo.id})">Editar</button>
                 <button onclick="excluirPeriodo(${periodo.id})">Excluir</button>
             </td>
         </tr>`;
 });
}

function abrirFormPeriodo() {
 document.getElementById('tituloFormPeriodo').textContent = 'Novo Período Letivo';
 document.getElementById('periodoId').value = '';
 document.getElementById('formPeriodo').reset();
 document.getElementById('formSectionPeriodo').style.display = 'block';
 document.getElementById('formSectionPeriodo').scrollIntoView({ behavior: 'smooth' });
}

function editarPeriodo(id) {
 const lista = get('periodos');
 const periodo = lista.find(p => p.id === id);
 if (!periodo) return;

 document.getElementById('tituloFormPeriodo').textContent = 'Editar Período Letivo';
 document.getElementById('periodoId').value = periodo.id;
 document.getElementById('periodoAno').value = periodo.ano;
 document.getElementById('periodoSemestre').value = periodo.semestre;
 document.getElementById('formSectionPeriodo').style.display = 'block';
 document.getElementById('formSectionPeriodo').scrollIntoView({ behavior: 'smooth' });
}

function salvarPeriodo(e) {
 e.preventDefault();

 const id = document.getElementById('periodoId').value;
 const ano = parseInt(document.getElementById('periodoAno').value);
 const semestre = document.getElementById('periodoSemestre').value;

 if (!ano || ano < 2020 || ano > 2030) {
     alert('Ano deve ser entre 2020 e 2030.');
     return;
 }

 if (!semestre) {
     alert('Selecione o semestre.');
     return;
 }

 let lista = get('periodos');

 if (lista.some(p => p.ano == ano && p.semestre == semestre && p.id != id)) {
     alert('Já existe um período com esse ano e semestre.');
     return;
 }

 if (id) {
     lista = lista.map(p => p.id == id ? { ...p, ano, semestre } : p);
     alert('Período atualizado com sucesso!');
 } else {
     lista.push({ id: gerarId(), ano, semestre });
     alert('Período cadastrado com sucesso!');
 }

 salvar('periodos', lista);
 cancelarFormulario();
 listarPeriodos();
}

function excluirPeriodo(id) {
 const turmas = get('turmas');
 if (turmas.some(t => t.periodo_id == id)) {
     alert('Não é possível excluir: existem turmas vinculadas a este período.');
     return;
 }

 const lista = get('periodos');
 const periodo = lista.find(p => p.id === id);
 if (!confirm(`Deseja realmente excluir o período ${periodo.ano}/${periodo.semestre}º?`)) return;

 salvar('periodos', lista.filter(p => p.id !== id));
 listarPeriodos();
 alert('Período excluído com sucesso!');
}

function listarTurmas() {
 const busca = document.getElementById('busca').value.toLowerCase();
 let lista = get('turmas');
 const cursos = get('cursos');
 const periodos = get('periodos');
 const tbody = document.getElementById('tabelaTurmas');
 tbody.innerHTML = '';

 if (busca) {
     lista = lista.filter(t => {
         const curso = cursos.find(c => c.id == t.curso_id);
         const periodo = periodos.find(p => p.id == t.periodo_id);
         return (curso && curso.nome.toLowerCase().includes(busca)) ||
                (periodo && String(periodo.ano).includes(busca));
     });
 }

 if (lista.length === 0) {
     tbody.innerHTML = `
         <tr class="mensagem-vazia">
             <td colspan="3">Nenhuma turma cadastrada ainda. Clique em "+ Novo Cadastro" para começar.</td>
         </tr>`;
     return;
 }

 lista.forEach(turma => {
     const curso = cursos.find(c => c.id == turma.curso_id);
     const periodo = periodos.find(p => p.id == turma.periodo_id);
     tbody.innerHTML += `
         <tr>
             <td><strong>${curso ? curso.nome : '—'}</strong></td>
             <td>${periodo ? `${periodo.ano} / ${periodo.semestre}º Semestre` : '—'}</td>
             <td>
                 <button onclick="editarTurma(${turma.id})">Editar</button>
                 <button onclick="excluirTurma(${turma.id})">Excluir</button>
             </td>
         </tr>`;
 });
}

function preencherSelectCursos(selecionado = '') {
 const cursos = get('cursos');
 const select = document.getElementById('turmaCurso');
 select.innerHTML = '<option value="">Selecione um curso</option>';
 cursos.forEach(c => {
     select.innerHTML += `<option value="${c.id}" ${c.id == selecionado ? 'selected' : ''}>${c.nome}</option>`;
 });
}

function preencherSelectPeriodos(selecionado = '') {
 const periodos = get('periodos');
 const select = document.getElementById('turmaPeriodo');
 select.innerHTML = '<option value="">Selecione um período</option>';
 periodos.forEach(p => {
     select.innerHTML += `<option value="${p.id}" ${p.id == selecionado ? 'selected' : ''}>${p.ano} / ${p.semestre}º Semestre</option>`;
 });
}

function abrirFormTurma() {
 document.getElementById('tituloFormTurma').textContent = 'Nova Turma';
 document.getElementById('turmaId').value = '';
 document.getElementById('formTurma').reset();
 preencherSelectCursos();
 preencherSelectPeriodos();
 document.getElementById('formSectionTurma').style.display = 'block';
 document.getElementById('formSectionTurma').scrollIntoView({ behavior: 'smooth' });
}

function editarTurma(id) {
 const lista = get('turmas');
 const turma = lista.find(t => t.id === id);
 if (!turma) return;

 document.getElementById('tituloFormTurma').textContent = 'Editar Turma';
 document.getElementById('turmaId').value = turma.id;
 preencherSelectCursos(turma.curso_id);
 preencherSelectPeriodos(turma.periodo_id);
 document.getElementById('formSectionTurma').style.display = 'block';
 document.getElementById('formSectionTurma').scrollIntoView({ behavior: 'smooth' });
}

function salvarTurma(e) {
 e.preventDefault();

 const id = document.getElementById('turmaId').value;
 const curso_id = document.getElementById('turmaCurso').value;
 const periodo_id = document.getElementById('turmaPeriodo').value;

 if (!curso_id) {
     alert('Selecione um curso.');
     return;
 }

 if (!periodo_id) {
     alert('Selecione um período letivo.');
     return;
 }

 let lista = get('turmas');

 if (lista.some(t => t.curso_id == curso_id && t.periodo_id == periodo_id && t.id != id)) {
     alert('Já existe uma turma com esse curso e período.');
     return;
 }

 if (id) {
     lista = lista.map(t => t.id == id ? { ...t, curso_id, periodo_id } : t);
     alert('Turma atualizada com sucesso!');
 } else {
     lista.push({ id: gerarId(), curso_id, periodo_id });
     alert('Turma cadastrada com sucesso!');
 }

 salvar('turmas', lista);
 cancelarFormulario();
 listarTurmas();
}

function excluirTurma(id) {
 const grupos = get('grupos');
 if (grupos.some(g => g.turma_id == id)) {
     alert('Não é possível excluir: existem grupos vinculados a esta turma.');
     return;
 }

 const lista = get('turmas');
 const turma = lista.find(t => t.id === id);
 if (!confirm('Deseja realmente excluir esta turma?')) return;

 salvar('turmas', lista.filter(t => t.id !== id));
 listarTurmas();
 alert('Turma excluída com sucesso!');
}

document.addEventListener('DOMContentLoaded', function () {
 document.getElementById('btnBuscar').addEventListener('click', listar);

 document.getElementById('busca').addEventListener('keypress', function (e) {
     if (e.key === 'Enter') listar();
 });

 document.getElementById('formCurso').addEventListener('submit', salvarCurso);
 document.getElementById('formPeriodo').addEventListener('submit', salvarPeriodo);
 document.getElementById('formTurma').addEventListener('submit', salvarTurma);

 listar();
});