//--------------------------------------------------------------------------------------//
// variables globales communes a plusieurs pages

//--------------------------------------------------------------------------------------//
// initialisation

function initialisePage() {
    // deplace le piston au bon endroit
    var element_piston = document.getElementById("piston_cale");
    element_piston.setAttribute("transform", 'translate(0 ' + dy_piston() + ')')

    // affiche la bonne pression et la bonne température
    affiche_pression_temperature(pression.toPrecision(3), Math.round(temperature));
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

function affiche_temperature_reservoir() {
    var affichage_temperature_reservoir = document.getElementById("affichage_temperature_resservoir");
    affichage_temperature_reservoir.innerHTML = temperature_reservoir.toString() + " K";

    // change la couleur
    fluide_reservoir = document.getElementById("fluide_reservoir");
    var x = (temperature_reservoir - temperature_reservoir_min)/(temperature_reservoir_max - temperature_reservoir_min);
    let r; let g; let b;
    if(x < 0.5) {
        r = 2*x*255; g = 2*x*255; b = (1-2*x)*255;
    } else {
        r = 255; g = (2-2*x)*255; b = 0;
    }
    let couleur = "rgb(" + r + "," + g + "," + b + ")";
    fluide_reservoir.setAttribute("fill", couleur);
    
}

