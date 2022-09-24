import { projects } from "./projects.js";

const imgLoc = ['../static/model_01.png','../static/model_02.png','../static/model_03.png','../static/model_04.png','../static/model_05.png','../static/model_06.png','../static/model_07.png','../static/model_08.png','../static/model_09.png','../static/model_10.png']

// Get all cards
const projectContainer = document.getElementById("projects-container");
const projectCards = Array.from(projectContainer.children);

const templateProjectCard = projectCards[0];

const baseURL = './viewer.html';

for(let project of projects) {

    // Create a new card
    const newCard = templateProjectCard.cloneNode(true);

    // Add project name to card
    const cardTitle = newCard.querySelector('h2');
    cardTitle.textContent = project.name;

    const imgCard = newCard.querySelector('img')
    imgCard.src = imgLoc[parseInt(project.id)-1]

    // Add project URL to card
    const button = newCard.querySelector('a');
    button.href = baseURL + `?id=${project.id}`;

    // Add card to container
    projectContainer.appendChild(newCard);
    
}

templateProjectCard.remove();
