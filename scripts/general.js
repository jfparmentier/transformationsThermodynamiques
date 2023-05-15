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
    let depart, arrivee, couleur_lab, couleur_rgb, progress;
    if(x < 0.5) {
        //depart = rgb2lab([0,0,255]);
        //arrivee = rgb2lab([255, 255, 0]);
        depart = [0, 0, 255];
        arrivee = [0, 255, 0];

        progress = 2*x;
    } else {
        // depart = rgb2lab([255,255,0]);
        // arrivee = rgb2lab([255, 0, 0]);
        depart = [0, 255, 0];
        arrivee = [255, 0, 0];

        progress = 2*x - 1;
    }
    // couleur_lab = arrivee.map((a, i) => 2*progress*(a - depart[i]) + depart[i]);
    // couleur_rgb = lab2rgb(couleur_lab);
    couleur_rgb = arrivee.map((a, i) => Math.round(progress*(a - depart[i]) + depart[i]));

    let couleur = "rgb(" + couleur_rgb[0] + "," + couleur_rgb[1] + "," + couleur_rgb[2] + ")";
    fluide_reservoir.setAttribute("fill", couleur);
    bouton_range_T.setAttribute("fill", couleur);
}

