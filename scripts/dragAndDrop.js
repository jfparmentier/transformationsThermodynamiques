// Variables pour stocker la position de départ du déplacement et la référence à l'élément rect déplacé
var startX = 0;
var startY = 0;
var currentElement = null;

// positions des masses
var x_masses_supports = [80, 113, 147, 179, 220, 261, 80, 130, 185, 250];
var x_masses_piston = [665, 720, 631, 755, 669, 709, 624, 745, 641, 721];

function getMousePosition(evt) {
    var svg = document.getElementById("SVG_simulation");
    var CTM = svg.getScreenCTM();
    if (evt.touches) { evt = evt.touches[0]; }
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

// Fonction pour déplacer un élément rect
function moveElement(event) {
  // Vérifier si un élément rect est sélectionné
  if (currentElement) {
    // Calculer la nouvelle position du rect
    var coord = getMousePosition(event);

    if(currentElement.classList.contains('btn_range')) {
        // on ne deplace que la coordonnee x dans les limites
        let x_min = - 12;
        let x_max = parseFloat(document.getElementById("range_temp_couleurs").getAttribute("width"))-12;

        var newX = coord.x - startX;
        newX = Math.max(newX, x_min);
        newX = Math.min(newX, x_max);
        // Déplacer le rect en utilisant les propriétés x et y de l'élément SVG
        currentElement.setAttribute('x', newX);

        let progress = (newX - x_min) / (x_max - x_min);
        // change la temperature du reservoir sans lancer la simulation
        temperature_reservoir = Math.round(temperature_reservoir_min + (temperature_reservoir_max - temperature_reservoir_min) * progress);
        temperature_reservoir = Math.round(100*Math.pow(16, progress));
        affiche_temperature_reservoir();
    }

    if(currentElement.classList.contains('masse')) {
        var newX = coord.x - startX;
        var newY = coord.y - startY;
    
        // Déplacer le rect en utilisant les propriétés x et y de l'élément SVG
        currentElement.setAttribute('x', newX);
        currentElement.setAttribute('y', newY);
    }
  }
}

// Fonction pour initialiser le déplacement d'un élément rect
function startMove(event) {
    if(!transformation_en_cours) {
        // Stocker la référence à l'élément rect sélectionné
        currentElement = this;

        // Stocker la position de départ du déplacement
        var coord = getMousePosition(event);
        startX = coord.x - currentElement.getAttribute('x');
        startY = coord.y - currentElement.getAttribute('y');

        // Annuler la sélection de texte lors du déplacement
        event.preventDefault();

        // change mouse icon
        this.classList.replace('draggable','dragged');
    }
}

// Fonction pour arrêter le déplacement d'un élément rect
function stopMove(event) {
    if(currentElement) {
        // move element to the correct position
        if(currentElement.classList.contains('masse')) {
            set_mass_final_position();
        }
        if(currentElement.classList.contains('btn_range')) {
            //
            start_transformation();
        }

        // change mouse icon
        currentElement.classList.replace('dragged','draggable');
    
        // no element is no more selected
        currentElement = null;
    }
}

function set_mass_final_position() {
    let x_masse_gauche = Number(currentElement.getAttribute("x"));
    let x_masse_droit = Number(x_masse_gauche) + Number(currentElement.getAttribute("width"));
    let y_masse_haut = Number(currentElement.getAttribute("y"));
    let numero_masse = Number(currentElement.getAttribute("name"));

    if((x_masse_droit > 621) && (x_masse_gauche < 791) && (y_masse_haut < y_piston())) {
        // the weight is released inside the piston
        let x_target = x_masses_piston[numero_masse - 1];  
        currentElement.setAttribute("x", x_target);

        // on the piston
        // let y_support = 371;
        let y_support = y_piston();
        currentElement.setAttribute("y", y_support - currentElement.getAttribute("height"));
        
        masses_posees[numero_masse - 1] = true;

    } else {
        // the weight is released outside the piston
        let x_target = x_masses_supports[numero_masse - 1];  
        currentElement.setAttribute("x", x_target);

        // select the correct support
        let y_support = (numero_masse > 6) ?  688 : 496;
        currentElement.setAttribute("y", y_support - currentElement.getAttribute("height"));

        masses_posees[numero_masse - 1] = false;
    }

    start_transformation();
}

// drag and drop initialisation
function statDragAndDrop() {
    // Ajouter un écouteur pour chaque élément rect draggable (masses) afin de lancer le déplacement
    var draggable_elements = document.querySelectorAll('rect.draggable');

    draggable_elements.forEach(function(element) {
        element.addEventListener('mousedown', startMove);
        element.addEventListener('mouseup', stopMove);
    });

    // Ajouter un écouteur pour suivre le mouvement de la souris
    // var svg = document.getElementById("SVG_simulation");
    document.addEventListener('mousemove', moveElement);
    document.addEventListener('mouseup', stopMove);
}

