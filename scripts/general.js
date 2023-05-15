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
    var fluide_reservoir = document.getElementById("fluide_reservoir");
    var bouton_range_T = document.getElementById("bouton_range_T");

    let x = (temperature_reservoir - temperature_reservoir_min)/(temperature_reservoir_max - temperature_reservoir_min);
    x = 0.75*x + 0.125;
    let couleur_rgb = jet_colormap(x, 'jet', false);
    let couleur = "rgb(" + couleur_rgb[0] + "," + couleur_rgb[1] + "," + couleur_rgb[2] + ")";
    fluide_reservoir.setAttribute("fill", couleur);
    bouton_range_T.setAttribute("fill", couleur);
}

function jet_colormap(x) {
    let r, g, b;    
    if(x < 0.125) {
        r = 0;
        g = 0;
        b = 0.5 + 4*x;
    } else if(x < 0.375) {
        r = 0;
        g = 4*(x-0.125);
        b = 1;
    } else if(x < 0.625) {
        r = 4*(x - 0.375);
        g = 1;
        b = 1 - 4*(x - 0.375);
    } else if(x < 0.875) {
        r = 1;
        g = 1 - 4*(x - 0.625);
        b = 0;
    } else {
        r = 1 - 4*(x - 0.875);
        g = 0;
        b = 0;

    }
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
}
