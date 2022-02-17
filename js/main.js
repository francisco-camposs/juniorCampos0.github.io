let contractAddress = '0x4B1b6607AF1aED6EABD2c50934E9749aB00fb5Db'.toLowerCase();

// Inicializa o objeto DApp
document.addEventListener("DOMContentLoaded", onDocumentLoad);
function onDocumentLoad() {
  DApp.init();
}

// Nosso objeto DApp que irá armazenar a instância web3
const DApp = {
  web3: null,
  contracts: {},
  account: null,

  init: function () {
    return DApp.initWeb3();
  },

  // Inicializa o provedor web3
  initWeb3: async function () {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ // Requisita primeiro acesso ao Metamask
          method: "eth_requestAccounts",
        });
        DApp.account = accounts[0];
        window.ethereum.on('accountsChanged', DApp.updateAccount); // Atualiza se o usuário trcar de conta no Metamaslk
      } catch (error) {
        console.error("Usuário negou acesso ao web3!");
        return;
      }
      DApp.web3 = new Web3(window.ethereum);
    } else {
      console.error("Instalar MetaMask!");
      return;
    }
    return DApp.initContract();
  },

  // Atualiza 'DApp.account' para a conta ativa no Metamask
  updateAccount: async function() {
    DApp.account = (await DApp.web3.eth.getAccounts())[0];
    atualizaInterface();
  },

  // Associa ao endereço do seu contrato
  initContract: async function () {
    DApp.contracts.CrowdFunding = new DApp.web3.eth.Contract(abi, contractAddress);
    return DApp.render();
  },

  // Inicializa a interface HTML com os dados obtidos
  render: async function () {
    inicializaInterface();
  },
};

// *** MÉTODOS (de consulta - view) DO CONTRATO ** //
function checkProject(address) {
	return DApp.contracts.CrowdFunding.methods.checkProject(address).call( { from: DApp.account } )
  .then(result => renderMeuProjeto(result))
  .catch((error) => {
    document.getElementById('abaMeuProjeto').innerText = "Não há projeto associado a essa carteira";
  });
}

function listProjects() {
	return DApp.contracts.CrowdFunding.methods.listProjects().call({ from: DApp.account }).then(result => { listaProjetos(result) });
}

function checkDonations() {
	return DApp.contracts.CrowdFunding.methods.checkDonations().call({ from: DApp.account }).then(result => { listarDoacoes(result) });
}


// *** MÉTODOS (de escrita) DO CONTRATO ** //

function createProject() {
	const days = document.getElementById("_days").value;
	const target = document.getElementById("_target").value;
	const title = document.getElementById("_title").value;
	const description = document.getElementById("_description").value;

	return DApp.contracts.CrowdFunding.methods.createProject(days, target, title, description).send( {from: DApp.account} ).then(resetForm("formCadastro"));
}

function donateToProject(event) {
  let addressProject = event.id;
	const valor = document.getElementById(addressProject + "_valor").value;

	return DApp.contracts.CrowdFunding.methods.donateToProject(addressProject).send({ from:  DApp.account, value: valor });
}


function concludeProject(address, tela) {
  return DApp.contracts.CrowdFunding.methods.concludeProject(address).send({ from:  DApp.account }).then(result => {
    resetTela(tela)
    if (tela == 'abaProjeto'){
      checkProject(address);
    } else {
      listProjects();
    }
  });
}

 function finishProject(address, tela) {
   return DApp.contracts.CrowdFunding.methods.finishProject(address).send({ from:  DApp.account }).then(result => {
    resetTela(tela)
    if (tela == 'abaProjeto'){
      showMeuProjeto();
    } else {
      listaProjetos()
    }
  });
 }

// Funções de manipular a tela
function inicializaInterface() {
  showMeuProjeto();
}

function alterarAba(event){
	const idList = ["_meuProjeto", "_cadastro", "_doacoes", "_projetos"];
	const idContenier = ["abaMeuProjeto", "abaCadastro", "abaDoacoes", "abaProjetos"];

	for(let i = 0; i < 4; i++){
		if(event.id == idList[i]){
			document.getElementById(idContenier[i]).removeAttribute("hidden");
      document.getElementById(idContenier[i]).parentNode.classList.add("active");
		}else {
			document.getElementById(idContenier[i]).setAttribute("hidden", " ");
      document.getElementById(idContenier[i]).parentNode.classList.remove("active");
		}
	}
}

function listarDoacoes(result){
  let projects = result;

  for(let i = 0; i < projects.length; i++){

    code = `<li class="list-group-item">Projeto: ${ projects[i][0] }, Valor: ${ projects[i][1] } </li>`;

    const parser = new DOMParser();
    const element = parser.parseFromString(code, "text/html");
    document.getElementById('listaDoacoes').append(element.body);
  }
}

function listaProjetos(result){

  

  let projects = result;

  if (projects.length == 0){
    document.getElementById('abaProjetos').innerHTML = "Ainda não há projetos cadastrados";
  }

  for(let i = 0; i < projects.length; i++){

    var date = new Date(parseInt(projects[i][1][1]) * 1000);

    let code = "";
    code += "<div class=\"card mt-4 mb-4\">\n";
    code += "<div class=\"card-header\">\n";
    code += `<h5 class=\"card-title\">${ projects[i][1][5] }</h5>\n`;
    code += "</div>\n";
    code += "<div class=\"card-body\">\n";
    code += `<span class=\"badge badge-primary\">Data final: ${ date.toLocaleDateString('pt-BR') }</span>\n`;
    code += `<span class=\"badge badge-secondary\">Valor alvo: ${ projects[i][1][2]}</span>\n`;
    code += `<span class=\"badge badge-success\">Arrecadado: ${ projects[i][1][3] }</span>\n`;
    code += `<span class=\"badge badge-danger\">Finalizado: ${ projects[i][1][4] ? 'Finalizado' : 'Aberto' }</span>\n`;
    code += "<p class=\"card-text\"></p>\n";
    code += `${ projects[i][1][6] }\n`;
    code += "</p>\n";
    code += "</div>\n";
    code += "<div class=\"card-footer\">\n";
    code += "<div class=\"btn-group mt-0 pt-0 mb-0 pb-0\" role=\"group\" aria-label=\"Basic example\">\n";
    code += "<div class=\"container\">\n";
    code += "<form>\n";
    code += "<div class=\"input-group mb-3\">\n";
    code += `<input type=\"text\" id=\"${ projects[i][0] }_valor\" class=\"form-control\" placeholder=\"Valor\" aria-label=\"Valor\" aria-describedby=\"basic-addon2\">\n`;
    code += "<div class=\"input-group-append\">\n";
    code += `<button class=\"btn btn-outline-secondary\" type=\"button\" id=\"${ projects[i][0] }\" onclick=\"donateToProject(this); document.getElementById('${ projects[i][0] }_valor').value = ''\">Doar</button>\n`;
    code += "</div>\n";
    code += "</div>\n";
    code += "</form>\n";
    code += `<button type=\"button\" class=\"btn btn-primary\" onClick=\"concluirProjeto('${ projects[i][0] }', 'abaProjetos');\">Concluir</button>\n`;
    code += `<button type=\"button\" class=\"btn btn-danger\" onClick=\"finalizarProjeto('${ projects[i][0] }', 'abaProjetos');\">Finalizar</button>\n`;
    code += "</div>\n";
    code += "</div>\n";
    code += "</div>\n";
    code += "</div>\n";
    code += "</div>\n";
    
    const parser = new DOMParser();
    const element = parser.parseFromString(code, "text/html");
    document.getElementById('abaProjetos').append(element.body);
  }
}

function resetForm(id){
  document.getElementById(id).reset();
}

function renderMeuProjeto(result){
  let project =  result;
  console.log(project);
  var date = new Date(parseInt(project['end']) * 1000);

  let code = "";
  code += "<div class=\"card mt-4 mb-4\">\n";
  code += "<div class=\"card-header\">\n";
  code += `<h5 class=\"card-title\">${ project['title'] }</h5>\n`;
  code += "</div>\n";
  code += "<div class=\"card-body\">\n";
  code += `<span class=\"badge badge-primary\">Data final: ${ date.toLocaleDateString('pt-BR') }</span>\n`;
  code += `<span class=\"badge badge-secondary\">Valor alvo: ${ project['target']}</span>\n`;
  code += `<span class=\"badge badge-success\">Arrecadado: ${ project['amount'] }</span>\n`;
  code += `<span class=\"badge badge-danger\">Finalizado: ${ project['finished'] ? 'Finalizado' : 'Aberto' }</span>\n`;
  code += "<p class=\"card-text\"></p>\n";
  code += `${ project['description'] }\n`;
  code += "</p>\n";
  code += "</div>\n";
  code += "<div class=\"card-footer\">\n";
  code += "<div class=\"btn-group mt-0 pt-0 mb-0 pb-0\" role=\"group\" aria-label=\"Basic example\">\n";
  code += "<div class=\"container\">\n";
  code += "<form>\n";
  code += "<div class=\"input-group mb-3\">\n";
  code += `<input type=\"text\" id=\"${ DApp.account }_valor\" class=\"form-control\" placeholder=\"Valor\" aria-label=\"Valor\" aria-describedby=\"basic-addon2\">\n`;
  code += "<div class=\"input-group-append\">\n";
  code += `<button class=\"btn btn-outline-secondary\" type=\"button\" id=\"${ DApp.account }\" onclick=\"donateToProject(this); document.getElementById('${ DApp.account }_valor').value = ''\">Doar</button>\n`;
  code += "</div>\n";
  code += "</div>\n";
  code += "</form>\n";
  code += `<button type=\"button\" class=\"btn btn-primary\" onClick=\"concluirProjeto('${ DApp.account }', 'abaMeuProjeto');\">Concluir</button>\n`;
  code += `<button type=\"button\" class=\"btn btn-danger\" onClick=\"finalizarProjeto('${ DApp.account }', 'abaMeuProjeto');\">Finalizar</button>\n`;
  code += "</div>\n";
  code += "</div>\n";
  code += "</div>\n";
  code += "</div>\n";
  code += "</div>\n";
  
  const parser = new DOMParser();
  const element = parser.parseFromString(code, "text/html");
  document.getElementById('abaMeuProjeto').append(element.body);
}

function resetTela(elemento) {
  document.getElementById(elemento).innerHTML = "";
}

function showMeuProjeto(){
  checkProject(DApp.account);
}

function concluirProjeto(address, tela){
  concludeProject(address, tela);
}

function finalizarProjeto(address, tela){
  finishProject(address, tela);
}