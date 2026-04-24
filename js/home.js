const sessao = JSON.parse(localStorage.getItem('sessao'));

if (!sessao || !sessao.logado) {
    alert("Acesso restrito! Por favor, realize o login.");
    window.location.href = 'login.html'; 
} else {
    renderMenu();
}

function renderMenu() {
    const userNameDisplay = document.getElementById('usuario-nome');
    if (userNameDisplay) {
        userNameDisplay.innerText = sessao.usuario;
    }

    if (sessao.tipo && sessao.tipo.toLowerCase() === 'comum') {
        const adminItem = document.getElementById('item-admin'); 
        if (adminItem) {
            adminItem.style.display = 'none';
        }
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => {
            localStorage.removeItem('sessao');
            window.location.href = 'login.html';
        };
    }
}