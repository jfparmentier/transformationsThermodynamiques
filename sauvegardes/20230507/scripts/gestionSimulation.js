// grandeurs physiques
var piston_libre = true;
var adiabatique = true; 

var reservoir_toujours_visible = false;
var temperature_reservoir = 300;

var hauteur_piston = 1/3; // en relatif entre 0 et 1
var temperature = 300; // en K
var pression = 1; // en bar ; P = 1 bar par défaut sans aucune masse
const cv = 2.5 // diatomic gaz (Cv/R)

var masses_posees = [false, false, false, false, false, false, false, false, false, false];
//const poids_masses = [0.25, 0.25, 0.5, 0.5, 1, 1, 2, 2, 4, 4];
const poids_masses = [0.1, 0.1, 0.2, 0.2, 0.4, 0.4, 0.8, 0.8, 1.6, 1.6];

var transformation_en_cours = false;

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
function select_adiabatique() {
    adiabatique = !adiabatique;
    
    var bounton_adiab_checked = document.getElementById("bouton_adiab_checked");
    var bounton_adiab_unchecked = document.getElementById("bouton_adiab_unchecked");
    var piston_conducteur = document.getElementById("piston_conducteur");
    var piston_isole = document.getElementById("piston_isole");

    var reservoir = document.getElementById("reservoir");

    if(adiabatique) {
        bounton_adiab_checked.setAttribute("visibility","visible");
        bounton_adiab_unchecked.setAttribute("visibility","hidden");

        piston_isole.setAttribute("visibility","visible");
        piston_conducteur.setAttribute("visibility","hidden");
        
        var visibilite_reservoir = reservoir_toujours_visible ? "visible" : "hidden";
        reservoir.setAttribute("visibility",visibilite_reservoir);

    } else {
        bounton_adiab_checked.setAttribute("visibility","hidden");
        bounton_adiab_unchecked.setAttribute("visibility","visible");

        piston_isole.setAttribute("visibility","hidden");
        piston_conducteur.setAttribute("visibility","visible");

        reservoir.setAttribute("visibility","visible");
    }
    start_transformation();
}
//-------------------------------------------------------------------------------------------------
function set_reservoir_visibility() {
    reservoir_toujours_visible = !reservoir_toujours_visible;
    var bouton_reservoir_visible_checked = document.getElementById("bouton_reservoir_visible_checked");
    var bouton_reservoir_visible_unchecked = document.getElementById("bouton_reservoir_visible_unchecked");
    if(reservoir_toujours_visible) {
        bouton_reservoir_visible_checked.setAttribute("visibility","visible");
        bouton_reservoir_visible_unchecked.setAttribute("visibility","hidden");
        var reservoir = document.getElementById("reservoir");
        reservoir.setAttribute("visibility","visible");        
    } else {
        bouton_reservoir_visible_checked.setAttribute("visibility","hidden");
        bouton_reservoir_visible_unchecked.setAttribute("visibility","visible");
        var reservoir = document.getElementById("reservoir");
        if (adiabatique) reservoir.setAttribute("visibility","hidden");
    }
}
//-------------------------------------------------------------------------------------------------
function start_transformation() {
    
    // état final
    var pression_finale;
    var temperature_finale;
    var hauteur_finale;

    if(piston_libre) {
        // equilibre mecanique
        pression_finale = poids_masses.reduce(function (accumulateur, valeurCourante, index) {
            return masses_posees[index] ? accumulateur + valeurCourante : accumulateur;
        }, 1); // en bar : 1 + les masses posees  

        if(adiabatique) {
            // transformation brusque adiabatique
            var X = pression_finale / pression;
            temperature_finale = temperature * (cv + X) / (cv + 1);    
        } else {
            // equilibre thermique
            temperature_finale = temperature_reservoir;
        }
        
        // loi des gaz parfaits
        hauteur_finale = hauteur_piston * pression  / pression_finale  * temperature_finale / temperature;
    } else {
        // transformation isochore
        hauteur_finale = hauteur_piston;

        if(adiabatique) {
            // le piston ne de deplace pas et il n'y a pas d'echanges de chaleur
            // W = 0 et Q = 0 donc DU = 0 donc T = cste
            temperature_finale = temperature;
        } else {
            // equilibre thermique
            temperature_finale = temperature_reservoir;            
        }

        // loi des gaz parfaits
        pression_finale = pression * temperature_finale / temperature * hauteur_piston / hauteur_finale;
    }
    
    // duree simulation
    var duree_simulation = 0;
    if((temperature != temperature_finale) || (pression == !pression_finale) || (hauteur_piston != hauteur_finale)) {
        duree_simulation = adiabatique ? 1000 : 2000;
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

            transformation_en_cours = false;
            affiche_pression_temperature(Math.round(pression*100)/100, Math.round(temperature));
        }

    }

    if(duree_simulation > 0) {
        affiche_pression_temperature('---', '---');
        transformation_en_cours = true;
        requestAnimationFrame(step);
    }
}