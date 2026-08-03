const filme = 
JSON.parse(
localStorage.getItem("filmeAtual")
);


if(filme){


document.getElementById(
"tituloFilme"
).innerText = filme.titulo;



document.getElementById(
"descricaoFilme"
).innerText =
filme.descricao || "";



const video =
document.getElementById(
"videoPlayer"
);



video.src =
filme.video;



}
else{


document.getElementById(
"tituloFilme"
).innerText =
"Nenhum filme selecionado";


}
