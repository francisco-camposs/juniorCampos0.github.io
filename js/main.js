let contractAddress = '0x0c2cb1737a3a3a5f5a8d60ed5e376da8d91da6b8';

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
function checkProject() {
	return DApp.contracts.CrowdFunding.methods.checkProject().call( { from: DApp.account } );
}

function listProjects() {
	return DApp.contracts.CrowdFunding.methods.listProjects().call({ from: DApp.account });
}

function checkDonations() {
	return DApp.contracts.CrowdFunding.methods.checkDonations().call({ from: DApp.account });
}


// *** MÉTODOS (de escrita) DO CONTRATO ** //

function createProject() {
	const days = document.getElementById("_days").value;
	const target = document.getElementById("_target").value;
	const title = document.getElementById("_title").value;
	const description = document.getElementById("_description").value;

	return DApp.contracts.CrowdFunding.methods.createProject(days, target, title, description).send( {from: DApp.account} ).then(resetForm("formCadastro"));
}

function donateToProject() {
	const valor = document.getElementById("_valor").value;

  //capturar projeto

	return DApp.contracts.CrowdFunding.methods.donateToProject().send({ from:  DApp.account, value: valor });
}


function concludeProject() {
  return DApp.contracts.CrowdFunding.methods.concludeProject().call({ from:  DApp.account });
}

 function finishProject() {

  //capturar projeto

   return DApp.contracts.CrowdFunding.methods.finishProject().call({ from:  DApp.account });
 }

// Funções de manipular a tela
function inicializaInterface() {
  console.log("Inicializada");

}

function alterarAba(event){
	const idList = ["_meuProjeto", "_cadastro", "_doacoes", "_projetos"];
	const idContenier = ["abaMeuProjeto", "abaCadastro", "abaDoacoes", "abaProjetos"];

  console.log(event.id);

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

function listaProjetos(){

  let projects = listProjects();

  console.log(projects);

  for(let i = 0; i < projects.length; i++){

    var date = new Date(projects[i].end);

    let code = "";
    code += "<div class=\"card mt-4 mb-4\">\n";
    code += "<div class=\"card-header\">\n";
    code += `<h5 class=\"card-title\">${ projects[i].title }</h5>\n`;
    code += "</div>\n";
    code += "<div class=\"card-body\">\n";
    code += `<span class=\"badge badge-primary\">Data final: ${ date.getTime() }</span>\n`;
    code += `<span class=\"badge badge-secondary\">Valor alvo: ${ projects[i].target }</span>\n`;
    code += `<span class=\"badge badge-success\">Arrecadado: ${ projects[i].amount }</span>\n`;
    code += `<span class=\"badge badge-danger\">Finalizado: ${ projects[i].finished ? 'Finalizado' : 'Aberto' }</span>\n`;
    code += "<p class=\"card-text\"></p>\n";
    code += `${ projects[i].description }\n`;
    code += "</p>\n";
    code += "</div>\n";
    code += "<div class=\"card-footer\">\n";
    code += "<div class=\"btn-group mt-0 pt-0 mb-0 pb-0\" role=\"group\" aria-label=\"Basic example\">\n";
    code += "<div class=\"container\">\n";
    code += "<form>\n";
    code += "<div class=\"input-group mb-3\">\n";
    code += "<input type=\"text\" id=\"_valor\" class=\"form-control\" placeholder=\"Valor\" aria-label=\"Valor\" aria-describedby=\"basic-addon2\">\n";
    code += "<div class=\"input-group-append\">\n";
    code += "<button class=\"btn btn-outline-secondary\" type=\"button\">Doar</button>\n";
    code += "</div>\n";
    code += "</div>\n";
    code += "</form>\n";
    code += "<button type=\"button\" class=\"btn btn-primary\">Concluir</button>\n";
    code += "<button type=\"button\" class=\"btn btn-danger\">Finalizar</button>\n";
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