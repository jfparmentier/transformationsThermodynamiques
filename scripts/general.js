//--------------------------------------------------------------------------------------//
// variables globales communes a plusieurs pages

//--------------------------------------------------------------------------------------//
// initialisation

function initialisePage() {

    // positionnement du piston
    //var piston = document.getElementById("piston");
    //piston.setAttribute('y', y_piston());
    var element_piston = document.getElementById("piston_cale_et_masses");
    element_piston.setAttribute("transform", 'translate(0 ' + y_piston() + ')')

    // gestion de la cale
    var checkbox_cale = document.getElementById('checkbox_cale');
    checkbox_cale.checked = !piston_libre;

    var cale = document.getElementById("cale");
    var cale_visibilite = piston_libre ? 'hidden' : 'visible';
    cale.setAttribute('visibility', cale_visibilite);

    // affichage des masses
    for (numero_masse = 1; numero_masse <= masses_posees.length; numero_masse++) {
        var element_masse = document.getElementById("masse" + numero_masse);
        let x = position_masses_sol[numero_masse - 1][0];
        let y = position_masses_sol[numero_masse - 1][1];
        element_masse.setAttribute("x", x);
        element_masse.setAttribute("y", y);
    }

    // affichage menu de droite
    let texte_pression = document.getElementById("texte_pression");
    texte_pression.innerHTML = Math.round(pression*10)/10;

    let texte_temp = document.getElementById("texte_temperature");
    texte_temp.innerHTML = Math.round(temperature);


    // lancement du simulateur
    requestAnimationFrame(animation);
}

// gestion du drag and drop
