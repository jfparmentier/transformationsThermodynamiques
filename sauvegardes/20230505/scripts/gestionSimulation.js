// grandeurs physiques
var piston_libre = true;
var adiabatique = true; 

var reservoir_visible = false;
var temperature_reservoir = 300;

var hauteur_piston = 0.35; // en relatif entre 0 et 1
var temperature = 300; // en K
var pression = 1; // en bar ; P = 1 bar par défaut sans aucune masse
const cv = 2.5 // diatomic gaz (Cv/R)

var masses_posees = [false, false, false, false, false, false, false, false, false, false];
const poids_masses = [0.25, 0.25, 0.5, 0.5, 1, 1, 2, 2, 4, 4];


//-------------------------------------------------------------------------------------------------
function dy_piston() {
    // retourne la valeur du y du piston en fonction de la hauteur relative du piston
    return dy_piston_from_hauteur(hauteur_piston);
}

function dy_piston_from_hauteur(hauteur) {
    // retourne la valeur du y du piston en fonction de la hauteur relative du piston
    return -283*hauteur;
}

function y_piston() {
    return 371 + dy_piston();
}

function y_piston_from_hauteur(hauteur) {
    // retourne la valeur du y du piston en fonction de la hauteur relative du piston
    return 371 + dy_piston_from_hauteur(hauteur);
}
//-------------------------------------------------------------------------------------------------
function deplace_cale() {
    piston_libre = !piston_libre;
    let cale = document.getElementById("cale");
    if(piston_libre) {
        cale.removeAttribute("transform");
    } else {
        cale.setAttribute("transform", 'translate(30 0)');
    }
    start_transformation();
}

//-------------------------------------------------------------------------------------------------
function start_transformation() {
    
    // pression finale
    var pression_finale;
    if(piston_libre) {
        pression_finale = poids_masses.reduce(function (accumulateur, valeurCourante, index) {
            return masses_posees[index] ? accumulateur + valeurCourante : accumulateur;
        }, 1); // en bar : 1 + les masses posees          
    } else {
        pression_finale = pression;
    }

    var temperature_finale;
    if(adiabatique) {
        // calcul temperature - transformation brusque
        var X = pression_finale / pression;
        temperature_finale = temperature * (cv + X) / (cv + 1);
    } else {
        temperature_finale = temperature_reservoir;
    }

    // ideal gaz law
    hauteur_finale = hauteur_piston * pression  / pression_finale  * temperature_finale / temperature;

    // duree simulation
    var duree_simulation = 0;
    if(!adiabatique) {
        duree_simulation = 2000;
    } else {
        if(piston_libre && (pression_finale !== pression)) {
            duree_simulation = 1000;
        }
    }

    let start = null;
    function step(timestamp) {
        if (start === null) start = timestamp;
        let progress = (timestamp - start) / duree_simulation;

        let x = Math.min(progress, 1);
        let h_t =  hauteur_piston + x * (2 - x) * (1 + (1-x)**2) * (hauteur_finale - hauteur_piston);
        
        // deplace le piston au bon endroit
        var element_piston = document.getElementById("piston_cale");
        element_piston.setAttribute("transform", 'translate(0 ' + dy_piston_from_hauteur(h_t) + ')')

        // deplace les masses poseees
        for (numero_masse = 1; numero_masse <= masses_posees.length; numero_masse++) {
            if(masses_posees[numero_masse - 1]) {
                var element_masse = document.getElementById("masse" + numero_masse);
                let y_support = y_piston_from_hauteur(h_t);
                element_masse.setAttribute("y", y_support - element_masse.getAttribute("height"));
            }
        }

        if(progress <= 1) {
            requestAnimationFrame(step);
        } else {
            pression = pression_finale;
            temperature = temperature_finale;
            hauteur_piston = hauteur_finale;

            affiche_pression_temperature(Math.round(pression*100)/100, Math.round(temperature));
        }

    }

    if(duree_simulation > 0) {
        affiche_pression_temperature('---', '---');
        requestAnimationFrame(step);
    }
}