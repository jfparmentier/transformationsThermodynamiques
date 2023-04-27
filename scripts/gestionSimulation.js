// grandeurs physiques
var piston_libre = true;
var hauteur_piston = 0.5; // en relatif entre 0 et 1
var temperature = 300; // en K
var masses_posees = [false, false, false, false, false, false];
var poids_masses = [1, 1, 1, 1, 1, 5];
var pression = poids_masses.reduce(function(accumulateur, valeurCourante, index){
    return masses_posees[index] ? accumulateur + valeurCourante : accumulateur;
}, 1); // en bar

var position_masses_sol = [[-35, 157], [-15, 157], [5, 157], [25, 157], [45, 157], [-10, 135]];
var position_masses_piston = [[143, -18], [123, -18], [163, -18], [103, -18], [183, -18], [130, -40]];

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

function desactive_menu(desactive) {
    var menu_parametres = document.getElementById("menu_parametres");
    menu_parametres.disabled = desactive;
}

function animation(timestamp) {

    // gestion déplacement piston
    if(simulation_en_cours) {
        transformation(timestamp);
    }

    // laché des masses
    chute_masses();

    // on recommence
    requestAnimationFrame(animation);
}

function chute_masses() {
    for (numero_masse = 1; numero_masse <= masses_posees.length; numero_masse++) {
        var element_masse = document.getElementById("masse" + numero_masse);
        if(element_masse.getAttribute("class") === 'static') {
            // alors on vient de lacher la masse
            // on regarde s'il est déposé sur le cylindre ou non
            let x_gauche_cylindre = document.getElementById("cylindre").getBoundingClientRect().left;
            let x_droit_cylindre = document.getElementById("cylindre").getBoundingClientRect().right;
            let x_masse = element_masse.getBoundingClientRect().right;

            if((x_masse > x_gauche_cylindre) && (x_masse < x_droit_cylindre)) {
                element_masse.removeAttribute("transform");
                let x = position_masses_piston[numero_masse - 1][0];
                let y_offset = position_masses_piston[numero_masse - 1][1];
                element_masse.setAttribute("x", x);
                element_masse.setAttribute("y", 165 + y_piston() + y_offset);

                masses_posees[numero_masse - 1] = true;
                debute_transformation();
            } else {
                element_masse.removeAttribute("transform");
                let x = position_masses_sol[numero_masse - 1][0];
                let y = position_masses_sol[numero_masse - 1][1];
                element_masse.setAttribute("x", x);
                element_masse.setAttribute("y", y);

                masses_posees[numero_masse - 1] = false;
                debute_transformation();
            }
            element_masse.setAttribute("class",'draggable');
        }
    }
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
        element_piston.setAttribute("transform", 'translate(0 ' + y_piston_from_hauteur(h_t) + ')');
        for (numero_masse = 1; numero_masse <= masses_posees.length; numero_masse++) {
            if(masses_posees[numero_masse - 1]) {
                var element_masse = document.getElementById("masse" + numero_masse);
                let y_masse = 88 + y_piston_from_hauteur(h_t) + position_masses_piston[numero_masse - 1][1];
                element_masse.setAttribute("transform", 'translate(0 ' + y_masse + ')');
            }
        }

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
