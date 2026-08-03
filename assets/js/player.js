/* =====================================
   V8 PLAY+
   PLAYER.JS
   Sistema de reprodução
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
"❌ Nenhum filme encontrado"
);


mostrarErro(
"Nenhum filme selecionado"
);


}

else{


const filme =
JSON.parse(dadosFilme);



console.log(
"✅ Filme carregado:",
filme.titulo
);



carregarFilme(
filme
);


}








/* ===============================
   CARREGAR DADOS
================================ */


function carregarFilme(filme){



const titulo =
document.getElementById(
"tituloFilme"
);



const descricao =
document.getElementById(
"descricaoFilme"
);



const capa =
document.getElementById(
"capaFilme"
);



const video =
document.getElementById(
"videoPlayer"
);





if(titulo){


titulo.innerText =
filme.titulo || "Sem título";


}





if(descricao){


descricao.innerText =
filme.descricao || 
"Sem descrição";


}





if(capa){


capa.src =
filme.capa || 
"assets/img/default.jpg";


}





if(video){


if(filme.video){


video.src =
filme.video;


console.log(
"▶ Vídeo carregado:",
filme.video
);


}

else{


console.warn(
"⚠ Filme sem link de vídeo"
);


}


}



}







/* ===============================
   ERRO
================================ */


function mostrarErro(mensagem){



const titulo =
document.getElementById(
"tituloFilme"
);



if(titulo){


titulo.innerText =
mensagem;


}


}
