// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Crowdfunding {

    // TODO Criar modificador para operações que somente podem ser feitas pelo dono do projeto, como concluir. 

    // Data struct definition
    struct Project {
        uint init;
        uint end;
        uint target;
        uint amount;
        bool finished;
        string title;
        string description;
    }

    struct Donation {
        address project;
        uint value;
    }

    /*  Criar um projeto com data para expirar
    **  Precisamos de uma forma de identificar cada projeto 
    */
    mapping (address => Project) projects;
    mapping (address => Donation[]) donations;
    address[] projectOwners;
    address[] donationOwners;


    event CreateProject(Project project);
    event CreateDonation(Donation donation);
    event ConcludeProject(string _title, uint _value);

    // Criar projeto, cria um novo projeto
    function createProject(uint _days, uint _target, string memory _title, string memory _description) external returns (Project memory) {
        require(!checkProjectExistence(msg.sender), "Ja existe um processo associado a esse endereco");
        
        Project memory project = Project(block.timestamp, block.timestamp + _days * 3600 * 24, _target, 0, false, _title, _description);
        projects[msg.sender] = project;
        projectOwners.push(msg.sender);

        emit CreateProject(project);
        return project;
    }

    // Apoiar projeto, transfere dinheiro para o montante do projeto
    function donateToProject(address _project) external payable returns (Donation memory) {
        require(checkProjectExistence(msg.sender), "Ja existe um processo associado a esse endereco");
        require(block.timestamp <= projects[msg.sender].end, "Projeto ja expirado, nao e possivel receber dinheiro");
        
        projects[_project].amount += msg.value;
        Donation memory donation = Donation(_project, msg.value);
        donations[msg.sender].push(donation);

        if (donations[msg.sender].length == 1)
            donationOwners.push(msg.sender);
        
        emit CreateDonation(donation);
        return donation;
    }

    // Concluir projeto, quando consegue o dinheiro até o prazo estipulado e encerra o projeto.
    // Somente dono do projeto pode concluir
    function concludeProject() external returns (Project memory){
        require(checkProjectExistence(msg.sender), "Ja existe um projeto associado a esse endereco");
        require(projects[msg.sender].amount >= projects[msg.sender].target, "Quantidade alvo ainda nao alcancada");

        projects[msg.sender].finished = true;
        payable(msg.sender).transfer(projects[msg.sender].amount * 9 / 10);

        emit ConcludeProject(projects[msg.sender].title, projects[msg.sender].amount * 9 / 10);
        return projects[msg.sender];
    }

    // Encerrar projeto, pode ser chamada a qualquer momento desde que o projeto não tenha sido concluido
    // Devolve 90% do dinheiro dos doadores
    // Somente dono do projeto ou dono do contrato pode chamar
    function finishProject() external {
        
    }

    // Ver um projeto especifico
    function checkProject(address _project) external {}

    // Ver projetos, tem que ser capaz de usar paginação
    function listProjects(uint _page) external {}

    // Devolver dinheiro dos apoiadores
    // Chamada pelo dono do projeto ao encerrar ou expirar o projeto
    function refundDonation(address _project) private {}

    // Permite a um usuario ver as doacoes que ele realizou
    function checkDonations() private {}



    function checkProjectExistence(address _project) private view returns (bool) {
        return keccak256(abi.encodePacked(projects[_project].title)) != keccak256(abi.encodePacked(''));
    }

}


