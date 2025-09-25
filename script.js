document.addEventListener('DOMContentLoaded', function() {
    // ==========================================================
    // INÍCIO: VARIÁVEIS E FUNÇÕES PRINCIPAIS
    // ==========================================================
    const dataScript = document.getElementById('mindmap-data');
    let data = {};
    let clockInterval = null; // Para controlar o relógio
    
    // Elementos da UI
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const branchList = document.getElementById('branch-list');
    const detailsWrapper = document.getElementById('details-wrapper');
    const adminActions = document.getElementById('admin-actions');
    const logoutButtonContainer = document.getElementById('logout-button-container');
    const logoutButton = document.getElementById('logout-button');
    const editDataButton = document.getElementById('edit-data-button');
    const dataEditorModal = document.getElementById('data-editor-modal');
    const jsonEditor = document.getElementById('json-editor');
    const saveDataButton = document.getElementById('save-data-button');
    const cancelDataButton = document.getElementById('cancel-data-button');
    const clockElement = document.getElementById('real-time-clock');

    // Credenciais
    const users = { admin: 'padrao123', user: 'gegcli2014' };

    // ==========================================================
    // FUNÇÃO: INICIAR RELÓGIO
    // ==========================================================
    function startClock() {
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(() => {
            const now = new Date();
            clockElement.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }, 1000);
    }
    
    // ==========================================================
    // FUNÇÃO: RENDERIZAR CONTEÚDO DO ORGANOGRAMA
    // ==========================================================
    function initializeContent() {
        // Carrega os dados do localStorage ou do script inicial
        try {
            const savedData = localStorage.getItem('mindmapData');
            data = savedData ? JSON.parse(savedData) : JSON.parse(dataScript.textContent);
        } catch (e) {
            console.error("Erro ao carregar dados JSON:", e);
            data = { branches: [] };
        }
        
        // Limpa conteúdo anterior
        branchList.innerHTML = '';
        detailsWrapper.innerHTML = '';

        if (!data || !data.branches) return;

        data.branches.forEach((branch) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${branch.name}</span><span class="arrow"></span>`;
            li.dataset.target = branch.id;
            branchList.appendChild(li);

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'branch-details';
            detailsDiv.id = branch.id;

            if (branch.teams && branch.teams.length > 0) {
                branch.teams.forEach(team => {
                    const groupDiv = document.createElement('div');
                    groupDiv.className = 'team-group';
                    let teamHTML = `<h2>${team.type}</h2>`;
                    team.contacts.forEach(contact => {
                        const parts = contact.split(': ');
                        const contactHTML = (parts.length > 1) 
                            ? `<div class="info">${parts[0]}:</div><div class="title">${parts[1]}</div>` 
                            : `<div class="title">${contact}</div>`;
                        teamHTML += `<div class="contact-card">${contactHTML}</div>`;
                    });
                    groupDiv.innerHTML = teamHTML;
                    detailsDiv.appendChild(groupDiv);
                });
            } else {
                detailsDiv.innerHTML = `<div class="team-group"><h2>Sem informações detalhadas no momento.</h2></div>`;
            }
            detailsWrapper.appendChild(detailsDiv);
        });

        // Adiciona listeners de clique aos itens da lista
        const listItems = document.querySelectorAll('#branch-list li');
        listItems.forEach(item => {
            item.addEventListener('click', function() {
                listItems.forEach(li => li.classList.remove('active'));
                document.querySelectorAll('.branch-details').forEach(div => div.classList.remove('active'));
                this.classList.add('active');
                document.getElementById(this.dataset.target).classList.add('active');
            });
        });

        // Clica no primeiro item por padrão
        if (listItems.length > 0) {
            listItems[0].click();
        }
    }

    // ==========================================================
    // LÓGICA DE LOGIN, LOGOUT E SESSÃO
    // ==========================================================
    function showLoginScreen() {
        if (clockInterval) clearInterval(clockInterval);
        mainContent.classList.remove('visible');
        loginScreen.classList.remove('hidden');
        loginForm.reset();
        sessionStorage.removeItem('loggedInUser');
    }

    function showMainScreen(username) {
        loginScreen.classList.add('hidden');
        mainContent.classList.add('visible');
        adminActions.style.display = (username === 'admin') ? 'block' : 'none';
        startClock();
        initializeContent();
    }
    
    logoutButton.addEventListener('click', showLoginScreen);

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        if (users[username] && users[username] === password) {
            loginError.textContent = '';
            sessionStorage.setItem('loggedInUser', username);
            showMainScreen(username);
        } else {
            loginError.textContent = 'Usuário ou senha inválidos.';
        }
    });

    // Lógica do Editor de Dados (Modal)
    editDataButton.addEventListener('click', () => {
        const currentData = JSON.parse(localStorage.getItem('mindmapData')) || data;
        jsonEditor.value = JSON.stringify(currentData, null, 4);
        dataEditorModal.classList.add('visible');
    });
    cancelDataButton.addEventListener('click', () => dataEditorModal.classList.remove('visible'));
    saveDataButton.addEventListener('click', () => {
        try {
            JSON.parse(jsonEditor.value);
            localStorage.setItem('mindmapData', jsonEditor.value);
            alert('Dados salvos com sucesso! A página será recarregada.');
            location.reload();
        } catch (e) {
            alert('Erro no formato JSON! Por favor, corrija antes de salvar.');
        }
    });
    
    // Verifica se já existe uma sessão ativa ao carregar a página
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
        showMainScreen(loggedInUser);
    }
});