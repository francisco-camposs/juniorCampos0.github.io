let contractAddress = '0x0c2CB1737A3a3a5F5A8d60eD5e376DA8D91dA6b8';

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
	return DApp.contracts.CrowdFunding.method.checkProject().call( { from: DApp.account } );
}

function listProjects() {
	return DApp.contracts.CrowdFunding.method.listProjects().call();
}

function checkDonations() {
	return DApp.contracts.CrowdFunding.method.checkDonations().call();
}


// *** MÉTODOS (de escrita) DO CONTRATO ** //

function createProject(){
	const days = document.getElementById("_days").value;
	const target = document.getElementById("_target").value;
	const title = document.getElementById("_title").value;
	const description = document.getElementById("_description").value;

	return DApp.contracts.CrowdFunding.method.createProject(days, target, title, description).send({from: DApp.account}).then(result => {
    console.log(result);
  });
}

function donateToProject(){
	const valor = document.getElementById("_valor").value;
	return DApp.contracts.CrowdFunding.method.donateToProject().send({ from:  DApp.account, value: valor })
}

// Funções de manipular a tela
function inicializaInterface() {
  console.log("É o Jukera!!!!");
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

