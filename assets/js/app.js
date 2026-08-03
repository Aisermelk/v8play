/* =====================================
   V8 PLAY+
   APP.JS
   Sistema principal
===================================== */


/* ===============================
   FIREBASE
================================ */

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";



console.log("🔥 Firebase conectado ao V8 Play+");

console.log("🚀 V8 Play+ iniciado");





/* ===============================
   INICIALIZAÇÃO
================================ */


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log("✅ Página carregada");


iniciarSite();


});






/* ===============================
   SISTEMA PRINCIPAL
================================ */


function iniciarSite(){


configurarLogin();


configurarPesquisa();


carregarCatalogo();


}







/* ===============================
   LOGIN
================================ */


function configurarLogin(){


const loginBtn =
document.getElementById("loginBtn");



if(loginBtn){


loginBtn.addEventListener(
"click",
()=>{


alert(
"Login V8 Play+ em desenvolvimento"
);


});


}


}








/* ===============================
   PESQUISA
================================ */


function configurarPesquisa(){


const searchInput =
document.getElementById("searchInput");



if(!searchInput) return;



searchInput.addEventListener(
"input",
(e)=>{


const texto =
e.target.value.toLowerCase();



document
.querySelectorAll(".movie-card")
.forEach(card=>{


const titulo =
card
.querySelector("h3")
.innerText
.toLowerCase();



if(titulo.includes(texto)){


card.style.display="block";


}

else{


card.style.display="none";


}



});


});


}







/* ===============================
   BUSCAR FILMES FIRESTORE
================================ */


async function carregarCatalogo(){


try{


console.log(
"🎬 Buscando filmes..."
);



const filmesRef =
collection(
db,
"filmes"
);



const snapshot =
await getDocs(
filmesRef
);



if(snapshot.empty){


console.log(
"Nenhum filme encontrado"
);


return;


}



snapshot.forEach(
(doc)=>{


const filme =
doc.data();



console.log(
"Filme encontrado:",
filme.titulo
);



mostrarFilme(
filme
);



});


}

catch(error){


console.error(
"Erro ao carregar filmes:",
error
);


}


}









/* ===============================
   CRIAR CARD DO FILME
================================ */


function mostrarFilme(filme){


let local;



switch(filme.plano){


case "FREE":

local =
document.getElementById(
"freeMovies"
);

break;



case "PRIME":

local =
document.getElementById(
"primeMovies"
);

break;



case "PREMIUM":

local =
document.getElementById(
"premiumMovies"
);

break;



default:

local =
document.getElementById(
"featuredMovies"
);


}



if(!local){

console.warn(
"Área do catálogo não encontrada"
);

return;

}






const card =
document.createElement(
"div"
);



card.className =
"movie-card";





card.innerHTML = `


<img
src="${filme.capa || 'assets/img/default.jpg'}"
alt="${filme.titulo}"
>


<div class="movie-info">


<h3>
${filme.titulo || "Sem título"}
</h3>



<span>
${filme.plano || "FREE"}
</span>



<button class="watch-btn">

▶ Assistir

</button>



</div>


`;







const botao =
card.querySelector(
".watch-btn"
);



botao.addEventListener(
"click",
()=>{


abrirPlayer(
filme
);


});





local.appendChild(
card
);



}








/* ===============================
   ABRIR PLAYER
================================ */


function abrirPlayer(filme){


console.log(
"▶ Abrindo:",
filme.titulo
);



localStorage.setItem(
"filmeAtual",
JSON.stringify(filme)
);



window.location.href =
"player.html";


}
