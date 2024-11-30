// Elementos da barra lateral e contadores
const cartSidebar = document.getElementById("cart-sidebar");
const cartItemsList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const totalPriceElement = document.getElementById("total-price");

// Array para armazenar os itens do carrinho
let cartItems = [];

// Função para abrir e fechar o carrinho
function toggleCart() {
    cartSidebar.classList.toggle("open");
}

function closeCart() {
    cartSidebar.classList.remove("open");
}

// Função para adicionar item ao carrinho
function addToCart(itemName, itemPrice) {
    const itemIndex = cartItems.findIndex(item => item.name === itemName);

    if (itemIndex > -1) {
        // Se o item já estiver no carrinho, aumenta a quantidade
        cartItems[itemIndex].quantity += 1;
    } else {
        // Se for um item novo, adiciona ao array
        cartItems.push({ name: itemName, price: parseFloat(itemPrice), quantity: 1 });
    }

    updateCart();
}

// Função para atualizar o carrinho
function updateCart() {
    // Limpa a lista de itens e atualiza com os itens do carrinho
    cartItemsList.innerHTML = "";
    let total = 0;
    let itemCount = 0;

    cartItems.forEach((item, index) => {
        total += item.price * item.quantity;
        itemCount += item.quantity;

        const listItem = document.createElement("li");
        listItem.innerHTML =
            `<span>${item.name}</span>
            <span>R$${(item.price * item.quantity).toFixed(2)}</span>
            <div class="cart-item-controls">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
                <button onclick="removeItem(${index})">
                    🗑️
                </button>
            </div>`
            ;
        cartItemsList.appendChild(listItem);
    });

    // Atualiza o total e o contador do carrinho
    cartCount.textContent = itemCount;
    totalPriceElement.textContent = `R$${total.toFixed(2)}`;
}

// Função para alterar a quantidade de um item
function changeQuantity(index, change) {
    cartItems[index].quantity += change;

    // Remove o item se a quantidade chegar a zero
    if (cartItems[index].quantity === 0) {
        cartItems.splice(index, 1);
    }
    updateCart();
}

// Função para remover um item do carrinho
function removeItem(index) {
    cartItems.splice(index, 1);
    updateCart();
}

// Evento de clique nos botões "Adicionar ao Carrinho"
document.querySelectorAll(".menu .box .btn").forEach(button => {
    button.addEventListener("click", (event) => {
        event.preventDefault();

        // Extrai o nome e o preço do item
        const itemName = button.parentElement.querySelector("h3").textContent;
        const itemPrice = button.parentElement.querySelector(".price").textContent.replace("R$", "").trim();

        // Adiciona o item ao carrinho
        addToCart(itemName, itemPrice);
    });
});

function searchItems() {
    const searchQuery = document.getElementById("search-input").value.toLowerCase().trim();
    const suggestionsContainer = document.getElementById("suggestions");

    // Limpa as sugestões a cada nova busca
    suggestionsContainer.innerHTML = "";

    if (!searchQuery) {
        suggestionsContainer.style.display = "none"; // Esconde o menu se não houver consulta
        return;
    }

    const items = document.querySelectorAll(".menu .box");
    const matchingItems = Array.from(items).filter(item => {
        const itemName = item.getAttribute("data-name").toLowerCase();
        return itemName.includes(searchQuery);
    });

    if (matchingItems.length > 0) {
        // Exibe o contêiner de sugestões
        suggestionsContainer.style.display = "block";

        matchingItems.forEach(item => {
            const suggestion = document.createElement("div");
            suggestion.textContent = item.getAttribute("data-name");
            suggestion.onclick = () => selectItem(item); // Função para selecionar o item
            suggestionsContainer.appendChild(suggestion);
        });
    } else {
        // Se não encontrar nada, exibe uma mensagem
        const noResult = document.createElement("div");
        noResult.textContent = "Nenhum item encontrado";
        noResult.style.color = "#999";
        suggestionsContainer.appendChild(noResult);
        suggestionsContainer.style.display = "block"; // Exibe o menu mesmo sem resultados
    }
}

document.getElementById("search-icon").addEventListener("click", function () {
    const searchInput = document.getElementById("search-input");

    if (!searchInput.style.display || searchInput.style.display === "none") {
        searchInput.style.display = "block";
        searchInput.focus();
    } else {
        searchInput.style.display = "none";
        searchInput.value = "";
        document.getElementById("suggestions").style.display = "none";
    }

});

function selectItem(item) {
    // Insere o nome do item no campo de busca
    document.getElementById("search-input").value = item.getAttribute("data-name");
    document.getElementById("suggestions").style.display = "none"; // Esconde o menu suspenso

    // Rola a página até o item selecionado
    item.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Adiciona evento ao botão "Finalizar Pedido"
document.getElementById("finalize-order-btn").addEventListener("click", function () {
    openModal();
});

// Função que abre o modal de finalizar pedido
function openModal() {
    const modal = document.getElementById("order-modal");
    modal.style.display = "block";
}

// Função que fecha o modal de finalizar pedido
function closeModal() {
    const modal = document.getElementById("order-modal");
    modal.style.display = "none";
}

// Finalizando o pedido
function finalizeOrder() {
    const deliveryMethod = document.getElementById("delivery-method").value;

    if (!deliveryMethod) {
        alert("Por favor, selecione o método de entrega.");
        return;
    }

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        alert("Você precisa estar logado para finalizar um pedido.");
        return;
    }

    const order = {
        id: Date.now(),
        items: [...cartItems],  // Todos os itens do carrinho
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),  // Total do pedido
        deliveryMethod,
        date: new Date().toLocaleString()  // Data do pedido
    };

    // Salvando o pedido no localStorage
    const allOrders = JSON.parse(localStorage.getItem("userOrders")) || {};
    const userOrders = allOrders[userEmail] || [];
    userOrders.push(order);

    allOrders[userEmail] = userOrders;
    localStorage.setItem("userOrders", JSON.stringify(allOrders));

    alert("Pedido finalizado com sucesso!");

    // Limpar o carrinho após finalizar o pedido
    cartItems = [];
    updateCart();
    closeModal();
}


// Fechar o modal quando o usuário clicar no 'X'
document.getElementById("close-order-history").addEventListener("click", function () {
    const modal = document.getElementById("order-history-modal");
    modal.style.display = "none";  // Fecha o modal
});



function saveOrder(order) {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    if (!loggedUser) {
        alert("Você precisa estar logado para salvar pedidos!");
        return;
    }

    // Recupera o histórico de pedidos do usuário
    let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || {};
    const userOrders = orderHistory[loggedUser.id] || [];

    // Adiciona o novo pedido
    userOrders.push(order);
    orderHistory[loggedUser.id] = userOrders;

    // Salva de volta no LocalStorage
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

    alert("Pedido salvo com sucesso!");
}

document.getElementById("order-history-btn").addEventListener("click", function () {
    console.log("Botão clicado!");

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        alert("Você precisa estar logado para acessar o histórico de pedidos!");
        return;
    }

    const allOrders = JSON.parse(localStorage.getItem("userOrders")) || {};
    const userOrders = allOrders[userEmail] || [];

    const orderHistoryList = document.getElementById("order-history-list");
    orderHistoryList.innerHTML = "";  // Limpa o conteúdo anterior

    console.log("Pedidos encontrados:", userOrders);  // Verifique se os pedidos estão corretos

    if (userOrders.length === 0) {
        orderHistoryList.innerHTML = "<li>Nenhum pedido encontrado.</li>";
    } else {
        userOrders.forEach((order, index) => {
            const orderItem = document.createElement("li");

            let orderDetails = `<b>Pedido ${index + 1}:</b> <br><b>Total:</b> R$${order.total.toFixed(2)} <br><b>Data:</b> ${order.date} <br><b>Método:</b> ${order.deliveryMethod}<br>`;

            // Exibe os itens do pedido
            order.items.forEach(item => {
                orderDetails += `${item.quantity} x ${item.name} - R$${(item.price * item.quantity).toFixed(2)}<br>`;
            });

            orderItem.innerHTML = orderDetails;
            orderHistoryList.appendChild(orderItem);
        });
    }

    const modal = document.getElementById("order-history-modal");
    console.log("Modal exibido:", modal);
});

function getOrderHistory() {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        alert("Você precisa estar logado para salvar ou acessar pedidos.");
        return;
    }

    // Recupera ou inicializa o histórico de pedidos
    const allOrders = JSON.parse(localStorage.getItem("userOrders")) || {};
    const userOrders = allOrders[userEmail] || [];

    // Adiciona novo pedido
    userOrders.push(order);
    allOrders[userEmail] = userOrders;

    // Salva de volta no localStorage
    localStorage.setItem("userOrders", JSON.stringify(allOrders));
}


window.onload = function () {
    if (localStorage.getItem("isLoggedIn") === "true") {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
            isLoggedIn = true;
            document.getElementById("login-link").style.display = "none";
            document.getElementById("register-link").style.display = "none";
            document.getElementById("logout-btn").style.display = "inline-block";
        } else {
            localStorage.setItem("isLoggedIn", "false");
        }
    }
};


// Abrir o modal
document.getElementById("order-history-btn").addEventListener("click", function () {
    const modal = document.getElementById("order-history-modal");
    modal.style.display = "block";
});

// Fechar o modal ao clicar no botão de fechar
document.getElementById("close-order-history").addEventListener("click", function () {
    const modal = document.getElementById("order-history-modal");
    modal.style.display = "none";
});

// Fechar o modal ao clicar fora da área do conteúdo
window.addEventListener("click", function (event) {
    const modal = document.getElementById("order-history-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Fechar o modal ao pressionar a tecla Esc
document.addEventListener("keydown", function (event) {
    const modal = document.getElementById("order-history-modal");
    if (event.key === "Escape") {
        modal.style.display = "none";
    }
});

function validateDeliveryFields() {
    const addressElement = document.getElementById("address-form");

    const numberElement = document.getElementById("number");
    const neighborhoodElement = document.getElementById("neighborhood");
    const phoneElement = document.getElementById("phone");
    const cityElement = document.getElementById("city");

    if (!addressElement || !numberElement || !neighborhoodElement || !phoneElement || !cityElement) {
        alert("Um ou mais campos obrigatórios estão ausentes.");
        return false;
    }

    const address = addressElement.value.trim();
    const number = numberElement.value.trim();
    const neighborhood = neighborhoodElement.value.trim();
    const phone = phoneElement.value.trim();
    const city = cityElement.value.trim();

    if (!address || !number || !neighborhood || !phone || !city) {
        alert("Por favor, preencha todos os campos obrigatórios para entrega.");
        return false;
    }

    return true;
}


function toggleAddressFields() {
    const deliveryMethod = document.getElementById("delivery-method").value;
    const deliveryFields = document.getElementById("delivery-fields");

    if (deliveryMethod === "entrega") {
        deliveryFields.style.display = "block";
    } else {
        deliveryFields.style.display = "none";
    }
}

// Fechar o modal de finalizar pedido ao clicar no botão de fechar
document.getElementById('close-order-modal').addEventListener('click', function () {
    document.getElementById('order-modal').style.display = 'none';
});

// Fechar o modal ao clicar fora do conteúdo
window.addEventListener('click', function (event) {
    const modal = document.getElementById('order-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


document.getElementById("delivery-method").addEventListener("change", toggleAddressFields);

// Adiciona evento ao botão "Finalizar Pedido"
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("finalize-order-btn").addEventListener("click", finalizeOrder);
});

document.querySelectorAll(".menu .box .know-more-btn").forEach(button => {
    button.addEventListener("click", (event) => {
        event.preventDefault(); // Impede que qualquer outra ação aconteça ao clicar

        const cupcake = button.closest(".box"); // Encontra o cupcake clicado
        const name = cupcake.querySelector("h3").textContent;
        const description = cupcake.getAttribute("data-description");
        const allergens = cupcake.getAttribute("data-allergens");

        // Exibe o modal com as informações
        document.getElementById("modal-title").textContent = name;
        document.getElementById("modal-description").textContent = description;
        document.getElementById("modal-allergens").textContent = "Alergênicos: " + allergens;

        // Exibe o modal
        document.getElementById("modal-more").style.display = "block";
    });
});

// Evento para fechar o modal quando clicar no "X"
document.querySelector(".modal-more .close").addEventListener("click", () => {
    document.getElementById("modal-more").style.display = "none";
});

// Fecha o modal se o usuário clicar fora da área do conteúdo
window.addEventListener("click", (event) => {
    if (event.target === document.getElementById("modal-more")) {
        document.getElementById("modal-more").style.display = "none";
    }
});

// Evento de clique no botão "Adicionar ao Carrinho"
document.querySelectorAll(".menu .box .add-to-cart-btn").forEach(button => {
    button.addEventListener("click", (event) => {
        event.preventDefault(); // Impede que qualquer outra ação aconteça ao clicar

        const cupcake = button.closest(".box"); // Encontra o cupcake clicado
        const itemName = cupcake.querySelector("h3").textContent;
        const itemPrice = cupcake.querySelector(".price").textContent.replace("R$", "").trim();

        // Adiciona o cupcake ao carrinho
        addToCart(itemName, itemPrice);
    });
});

// Variável para controlar o estado de login
// let isLoggedIn = false;

// Abrir o modal de login/registro
document.getElementById('login-link').addEventListener('click', function () {
    document.getElementById('modal-auth').style.display = 'block';
    document.getElementById('modal-title-auth').textContent = 'Login';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
});

document.getElementById('register-link').addEventListener('click', function () {
    document.getElementById('modal-auth').style.display = 'block';
    document.getElementById('modal-title-auth').textContent = 'Registrar';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

// Fechar o modal
document.getElementById('close-modal-auth').addEventListener('click', function () {
    document.getElementById('modal-auth').style.display = 'none';
});

// Alternar para a tela de registro
document.getElementById('go-to-register').addEventListener('click', function () {
    document.getElementById('modal-title-auth').textContent = 'Registrar';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

// Alternar para a tela de login
document.getElementById('go-to-login').addEventListener('click', function () {
    document.getElementById('modal-title-auth').textContent = 'Login';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
});

// Variável para verificar se o usuário está logado (baseada no localStorage)
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

window.onload = function () {
    // Atualiza o estado de autenticação
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        // O usuário está logado
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
    } else {
        // O usuário não está logado
        document.getElementById('login-link').style.display = 'inline-block';
        document.getElementById('register-link').style.display = 'inline-block';
        document.getElementById('logout-btn').style.display = 'none';
    }
};

// Evento de login
document.getElementById('login-btn').addEventListener('click', function () {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const storedEmail = localStorage.getItem('userEmail');
    const storedPassword = localStorage.getItem('userPassword');

    // Verificar se o email e a senha coincidem com os dados registrados
    if (email === storedEmail && password === storedPassword) {
        localStorage.setItem("isLoggedIn", "true"); // Salva o estado de login
        alert('Login bem-sucedido!');
        atualizarEstadoAutenticacao();
        document.getElementById('modal-auth').style.display = 'none';
    } else {
        alert('Email ou senha incorretos!');
    }
});

// Evento de logout
document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.setItem('isLoggedIn', 'false'); // Atualiza o estado no localStorage
    localStorage.removeItem('userEmail'); // Remove o email do usuário logado
    cartItems = []; // Limpa o carrinho (opcional)
    updateCart();
    atualizarEstadoAutenticacao();
});

// Função para atualizar o estado de autenticação
function atualizarEstadoAutenticacao() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        // Ajusta o estado do DOM para usuário logado
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
    } else {
        // Ajusta o estado do DOM para usuário deslogado
        document.getElementById('login-link').style.display = 'inline-block';
        document.getElementById('register-link').style.display = 'inline-block';
        document.getElementById('logout-btn').style.display = 'none';
    }
}

// Registro de usuário
document.getElementById('register-btn').addEventListener('click', function () {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (name && email && password) {
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('isLoggedIn', 'true'); // Marca como logado
        alert('Registro bem-sucedido!');
        atualizarEstadoAutenticacao();
        document.getElementById('modal-auth').style.display = 'none';
    } else {
        alert('Por favor, preencha todos os campos de registro!');
    }
});



// Lógica para o registro (armazenar os dados no localStorage)
document.getElementById('register-btn').addEventListener('click', function () {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Armazenar os dados de registro no localStorage
    if (name && email && password) {
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        alert('Registro bem-sucedido!');
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        document.getElementById('modal-auth').style.display = 'none';
    } else {
        alert('Por favor, preencha todos os campos de registro!');
    }
});




// Função que simula o processo de finalização da compra
document.getElementById('finalizar-compra-btn').addEventListener('click', function () {
    if (isLoggedIn) {
        alert('Compra finalizada com sucesso!');
    } else {
        alert('Você precisa estar logado para finalizar a compra. Por favor, faça login ou registre-se.');
        document.getElementById('modal-auth').style.display = 'block';
        document.getElementById('modal-title-auth').textContent = 'Login';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    }
});