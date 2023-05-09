//--------------------------------------------------------------------------------------//
// variables globales communes a plusieurs pages

//--------------------------------------------------------------------------------------//
// initialisation

function initialisePage() {
    // deplace le piston au bon endroit
    var element_piston = document.getElementById("piston_cale");
    element_piston.setAttribute("transform", 'translate(0 ' + dy_piston() + ')')

    // affiche la bonne pression et la bonne température
    affiche_pression_temperature(pression, temperature);
    add_point_PVdiag(pression, hauteur_piston, temperature);

    // initialisation drag and drop
    statDragAndDrop();

    // initialisation du simulateur
    // 
    //requestAnimationFrame(animation);
}

function affiche_pression_temperature(P, T) {
    var affichage_pression = document.getElementById("affichage_pression");
    affichage_pression.innerHTML = `${P} bar`
    var affichage_temperature = document.getElementById("affichage_temperature");
    affichage_temperature.innerHTML = `${T} K`

}

