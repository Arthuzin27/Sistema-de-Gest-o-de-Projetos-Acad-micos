const btnlogin = document.getElementById('submit');

btnlogin.onclick = () => {
    const user = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    if (!user.includes('@') || !user.includes('.')) {
        return alert('E-mail inválido! Deve conter "@" e "."');
    }
    if (pass.length < 6) {
        return alert('A senha deve ter no mínimo 6 caracteres.');
    }

    const users = JSON.parse(localStorage.getItem('USERS')) || [];
    const authUser = users.find(item => item.email === user && item.pass === pass);

    if (authUser) {
        localStorage.setItem('sessao', JSON.stringify({ 
            logado: true, 
            usuario: user, 
            tipo: authUser.tipo 
        }));
        window.location.href = './index.html'; 
    } else {
        alert('Usuário ou senha inválidos');
    }
};

const btndatabase = document.getElementById('database');
btndatabase.onclick = () => {
    const testUsers = [
        { email: 'admin@admin.com', pass: '123456', tipo: 'admin' },
        { email: 'user@admin.com', pass: '123456', tipo: 'comum' }
    ];
    localStorage.setItem('USERS', JSON.stringify(testUsers));
    alert('Dados carregados: admin@admin.com e user@admin.com');
};
