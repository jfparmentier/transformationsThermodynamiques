// grandeurs physiques
var piston_libre = true;
var hauteur_piston = 0.5; // en relatif entre 0 et 1
var temperature = 300; // en K
var masses_posees = [false, false, false, false, false, false];
var poids_masses = [1, 1, 1, 1, 1, 5];
var pression = poids_masses.reduce(function(accumulateur, valeurCourante, index){
    return masses_posees[index] ? accumulateur + valeurCourante : accumulateur;
}, 1); // en bar

var cv = 2.5 // capacité thermique divisée par R

// parametres de simulation
var temps_debut_simulation = null;
var temps_precedent = null; // pour eviter de faire les calculs plusieurs fois pendant la même milliseconde
var simulation_en_cours = false;
var pression_finale;
var temperature_finale;
var hauteur_finale;
var duree_simulation_meca = 750;
var duree_simulation_thermique;

function y_piston() {
    // retourne la valeur du y du piston en fonction de la hauteur relative du piston
    return y_piston_from_hauteur(hauteur_piston);
}

function y_piston_from_hauteur(hauteur) {
    // retourne la valeur du y du piston en fonction de la hauteur relative du piston
    return -140*hauteur;
}

function bloque_libere_piston() {
    piston_libre = !piston_libre;
    var checkbox_cale = document.getElementById('checkbox_cale');
    checkbox_cale.checked = !piston_libre;

    var cale_visibilite = piston_libre ? 'hidden' : 'visible';
    cale.setAttribute('visibility', cale_visibilite);

    debute_transformation();
}

function ajoute_enleve_masse(numero_masse) {
    masses_posees[numero_masse - 1] = !masses_posees[numero_masse - 1];
    var checkbox_masse = document.getElementById('checkbox_masse' + numero_masse);
    checkbox_masse.checked = masses_posees[numero_masse - 1];

    var masse_visibilite = masses_posees[numero_masse - 1] ? 'visible' : 'hidden';
    var element_masse = document.getElementById("masse" + numero_masse);
    element_masse.setAttribute('visibility', masse_visibilite);

    debute_transformation();
}

function desactive_menu(desactive) {
    var menu_parametres = document.getElementById("menu_parametres");
    menu_parametres.disabled = desactive;
}

function animation(timestamp) {

    // gestion déplacement piston
    if(simulation_en_cours) {
        transformation(timestamp);
    }

    // gestion drag and drop

    // on recommence
    requestAnimationFrame(animation);
}

function transformation(timestamp) {

    if (temps_debut_simulation === null) {
        temps_debut_simulation = timestamp;
    }


    // partie transformation meca adiabatique
    if(piston_libre) {
        let progress = (timestamp - temps_debut_simulation) / duree_simulation_meca;

        let x = Math.min(progress, 1);
        //let h_t =  hauteur_piston + x * (2 - x) * (hauteur_finale - hauteur_piston);
        let h_t =  hauteur_piston + x * (2 - x) * (1 + (1-x)**2) * (hauteur_finale - hauteur_piston);

        var element_piston = document.getElementById("piston_cale_et_masses");
        element_piston.setAttribute("transform", 'translate(0 ' + y_piston_from_hauteur(h_t) + ')')
        element_piston.setAttribute("transform", 'translate(0 ' + y_piston_from_hauteur(h_t) + ')');

        if(progress > 1) {
            termine_transformation();
        }
    } else {
        termine_transformation();
    }

}

function debute_transformation() {
    desactive_menu(true);

    if(piston_libre) {
        pression_finale = poids_masses.reduce(function (accumulateur, valeurCourante, index) {
            return masses_posees[index] ? accumulateur + valeurCourante : accumulateur;
        }, 1); // en bar
        duree_simulation_meca = (pression_finale !== pression) ? 1000 : 1;
    } else {
        pression_finale = pression;
    }

    var X = pression_finale / pression;

    // transformation toujours brusque
    temperature_finale = temperature * (cv + X) / (cv + 1);

    // loi des gaz parfaits
    hauteur_finale = hauteur_piston * pression  / pression_finale  * temperature_finale / temperature;


    duree_simulation_thermique = 2000; // en ms

    simulation_en_cours = true;
}

function termine_transformation() {
    simulation_en_cours = false;

    temps_debut_simulation = null;
    hauteur_piston = hauteur_finale;
    pression = pression_finale;
    temperature = temperature_finale;

    let texte_pression = document.getElementById("texte_pression");
    texte_pression.innerHTML = Math.round(pression*10)/10;

    let texte_temp = document.getElementById("texte_temperature");
    texte_temp.innerHTML = Math.round(temperature);

    desactive_menu(false);
}
