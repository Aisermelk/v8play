/* =====================================
   V8 PLAY+
   PLAYER.JS
===================================== */


console.log("🎬 Player iniciado");



const dadosFilme =
localStorage.getItem("filmeAtual");



console.log(
"💾 Dados recebidos:",
dadosFilme
);



const filme =
JSON.parse(dadosFilme);





if(!filme){


console.error(
"❌ Nenhum filme encontrado no localStorage"
);


document.getElementById(
"tituloFilme"
).innerText =
"Nenhum filme selecionado";


}

else{


console.log(
"✅ Filme carregado:",
filme.titulo
);




const titulo =
document.getElementById(
"tituloFilme"
);



const descricao =
document.getElementById(
"descricaoFilme"
);



const video =
document.getElementById(
"videoPlayer"
);



if(titulo){

titulo.innerText =
filme.titulo;

}



if(descricao){

descricao.innerText =
filme.descricao || "Sem descrição";

}



if(video && filme.video){


video.src =
filme.video;


}



}
