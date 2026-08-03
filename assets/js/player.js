/* =====================================
   V8 PLAY+
   PLAYER.JS
   Player inteligente
===================================== */


console.log("🎬 Player V8 Play+ iniciado");





/* ===============================
   RECEBER FILME
================================ */


const dadosFilme =
localStorage.getItem("filmeAtual");



console.log(
"💾 Dados recebidos:",
dadosFilme
);





if(!dadosFilme){


console.error(
"❌ Nenhum filme selecionado"
);



document.getElementById(
"tituloFilme"
).innerText =
"Nenhum filme encontrado";



}

else{


const filme =
JSON.parse(dadosFilme);



console.log(
"✅ Filme carregado:",
filme.titulo
);



carregarDados(
filme
);


carregarVideo(
filme.video
);



}







/* ===============================
   DADOS DO FILME
================================ */


function carregarDados(filme){



const titulo =
document.getElementById(
"tituloFilme"
);



const capa =
document.getElementById(
"capaFilme"
);



const descricao =
document.getElementById(
"descricaoFilme"
);



const ano =
document.getElementById(
"anoFilme"
);



const categoria =
document.getElementById(
"categoriaFilme"
);





if(titulo){

titulo.innerText =
filme.titulo || "Sem título";

}





if(capa){

capa.src =
filme.capa ||
"assets/img/default.jpg";

}





if(descricao){

descricao.innerText =
filme.descricao ||
"Sem descrição";

}





if(ano){

ano.innerText =
filme.ano || "";

}





if(categoria){

categoria.innerText =
filme.categoria || "";

}





}







/* ===============================
   PLAYER AUTOMÁTICO
================================ */


function carregarVideo(url){



if(!url){


console.warn(
"⚠ Sem vídeo cadastrado"
);


return;


}





const youtube =
document.getElementById(
"youtubePlayer"
);



const video =
document.getElementById(
"videoPlayer"
);






/* ===============================
   YOUTUBE
================================ */



if(
url.includes("youtube.com") ||
url.includes("youtu.be")
){



let videoId;



if(url.includes("watch?v=")){


videoId =
url.split("watch?v=")[1]
.split("&")[0];


}


else if(url.includes("youtu.be")){


videoId =
url.split("youtu.be/")[1];


}




youtube.src =
`https://www.youtube.com/embed/${videoId}`;



youtube.style.display =
"block";



console.log(
"▶ YouTube carregado:",
videoId
);



}





/* ===============================
   MP4
================================ */


else if(
url.endsWith(".mp4")
){



video.src =
url;



video.style.display =
"block";



console.log(
"▶ MP4 carregado:",
url
);



}





else{


console.warn(
"Formato de vídeo não reconhecido:",
url
);



}



}
