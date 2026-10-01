const URL_API = "http://localhost:3000/jogos";


window.onload = function() {
  carregarJogos();
  carregarTema(); 
};


function alternarTema() {
  document.body.classList.toggle("dark-mode");

  const estaNoModoEscuro = document.body.classList.contains("dark-mode");
  const btnTema = document.getElementById("btn-tema");

  if (estaNoModoEscuro) {
    btnTema.innerText = " Modo Claro";
    localStorage.setItem("tema", "escuro"); 
  } else {
    btnTema.innerText = "Modo Escuro";
    localStorage.setItem("tema", "claro");
  }
}

function carregarTema() {
  const temaSalvo = localStorage.getItem("tema");
  const btnTema = document.getElementById("btn-tema");

  if (temaSalvo === "escuro") {
    document.body.classList.add("dark-mode");
    if (btnTema) btnTema.innerText = " Modo Claro";
  }
}

// 2. LISTAR E FILTRAR (GET)
function carregarJogos() {
  fetch(URL_API)
    .then(resposta => {
      if (!resposta.ok) throw new Error("Erro na comunicação com o servidor.");
      return resposta.json();
    })
    .then(jogos => {
      document.getElementById("mensagem-erro").innerText = "";
      atualizarDashboard(jogos);

      const textoPesquisa = document.getElementById("pesquisa").value.toLowerCase();
      const statusFiltro = document.getElementById("filtro-status").value;

      const divLista = document.getElementById("lista-jogos");
      divLista.innerHTML = "";

      jogos.forEach(jogo => {
        const bateuTitulo = jogo.titulo.toLowerCase().includes(textoPesquisa);
        const bateuStatus = statusFiltro === "" || jogo.status === statusFiltro;

        if (bateuTitulo && bateuStatus) {
          divLista.innerHTML += `
            <div class="card-jogo">
              <h3>${jogo.titulo}</h3>
              <p><strong>Gênero:</strong> ${jogo.genero} | <strong>Plataforma:</strong> ${jogo.plataforma}</p>
              <p><strong>Nota:</strong> ${jogo.nota} | <strong>Status:</strong> ${jogo.status}</p>
              <button onclick="prepararEdicao('${jogo.id}', '${jogo.titulo}', '${jogo.genero}', '${jogo.plataforma}', ${jogo.nota}, '${jogo.status}')">Editar</button>
              <button onclick="excluirJogo('${jogo.id}')">Excluir</button>
            </div>
          `;
        }
      });
    })
    .catch(erro => {
      console.error(erro);
      document.getElementById("mensagem-erro").innerText = "Não foi possível conectar a api.";
    });
}

// 3. ATUALIZAR DASHBOARD
function atualizarDashboard(jogos) {
  let jogando = 0;
  let finalizados = 0;

  jogos.forEach(jogo => {
    if (jogo.status === "Jogando") jogando++;
    if (jogo.status === "Finalizado") finalizados++;
  });

  document.getElementById("total-jogos").innerText = jogos.length;
  document.getElementById("total-jogando").innerText = jogando;
  document.getElementById("total-finalizados").innerText = finalizados;
}

// 4. CADASTRAR OU EDITAR (POST / PUT)
document.getElementById("form-jogo").onsubmit = function(evento) {
  evento.preventDefault();

  const id = document.getElementById("id-jogo").value;
  const nota = parseFloat(document.getElementById("nota").value);

  if (nota < 0 || nota > 10) {
    document.getElementById("mensagem-erro").innerText = "A nota tem que ser entre 0 e 10!";
    return;
  }

  const jogo = {
    titulo: document.getElementById("titulo").value,
    genero: document.getElementById("genero").value,
    plataforma: document.getElementById("plataforma").value,
    nota: nota,
    status: document.getElementById("status").value
  };

  let metodo = "POST";
  let url = URL_API;

  if (id !== "") {
    metodo = "PUT";
    url = `${URL_API}/${id}`;
  }

  fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jogo)
  })
  .then(resposta => {
    if (!resposta.ok) throw new Error("Erro ao querer salvar dados.");
    return resposta.json();
  })
  .then(() => {
    limparFormulario();
    carregarJogos();
  })
  .catch(erro => {
    document.getElementById("mensagem-erro").innerText = "Erro ao salvar o jogo.";
  });
};
function prepararEdicao(id, titulo, genero, plataforma, nota, status) {
  document.getElementById("id-jogo").value = id;
  document.getElementById("titulo").value = titulo;
  document.getElementById("genero").value = genero;
  document.getElementById("plataforma").value = plataforma;
  document.getElementById("nota").value = nota;
  document.getElementById("status").value = status;
  document.getElementById("titulo-form").innerText = "Editar o Jogo";
  document.getElementById("btn-cancelar").style.display = "inline";
}
function limparFormulario() {
  document.getElementById("id-jogo").value = "";
  document.getElementById("form-jogo").reset();
  document.getElementById("titulo-form").innerText = "Cadastrar o Jogo";
  document.getElementById("btn-cancelar").style.display = "none";
  document.getElementById("mensagem-erro").innerText = "";
}
function excluirJogo(id) {
  if (confirm("Tem certeza que quer excluir este jogo?")) {
    fetch(`${URL_API}/${id}`, {
      method: "DELETE"
    })
    .then(resposta => {
      if (!resposta.ok) throw new Error("Erro ao excluir.");
      carregarJogos();
    })
    .catch(erro => {
      document.getElementById("mensagem-erro").innerText = "Erro ao excluir o jogo.";
    });
  }
}