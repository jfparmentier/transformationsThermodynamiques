// gestion du diagramme PV
var liste_points = [];
const offset_x = 53;
const offset_y = 7*53;
const sx = 6*53;
const sy = -53;
var couleur_points = "blue";

function set_color(cercle_svg) {
    couleur_points = cercle_svg.getAttribute("fill");

    var btns_couleur_svg = document.querySelectorAll('circle.btn_couleur_svg');
    btns_couleur_svg.forEach(function(element) {
        element.setAttribute("stroke-width", 1);
        console.log(element);
    });
    cercle_svg.setAttribute("stroke-width", 3);

}

function add_point_PVdiag(P, V, T) {
    liste_points.push([Math.round(P*1000)/1000, Math.round(V*1000)/1000, Math.round(T*10)/10]);

    var x = offset_x + sx * V;
    var y = offset_y + sy * P;

    var points_diagPV = document.getElementById("points_diagPV");

    var new_point = document.createElementNS("http://www.w3.org/2000/svg",'circle');
    new_point.setAttribute("cx", Math.round(x*100)/100);
    new_point.setAttribute("cy", Math.round(y*100)/100);
    new_point.setAttribute("r", 4);
    new_point.setAttribute("fill", couleur_points);
    new_point.setAttribute("stroke",'black');
    points_diagPV.appendChild(new_point);
}

function clear_points() {
    liste_points = [];

    var points_diagPV = document.getElementById("points_diagPV");
    points_diagPV.innerHTML = '';
    //add_point_PVdiag(pression, hauteur_piston, temperature);
}

function download_points() {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(liste_points.join('\n')));
    element.setAttribute('download', 'PVT.txt');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}