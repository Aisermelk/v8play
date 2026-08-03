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
getDocs,
query,
where
}
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";





console.log("🚀 V8 Play+ iniciado");





/* ===============================
   INICIALIZAÇÃO
================================ */


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"✅ Página carregada"
);


iniciarSite();


});






/* ===============================
   FUNÇÃO PRINCIPAL
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



if(searchInput){


searchInput.addEventListener(
"input",
(e)=>{


console.log(
"Pesquisando:",
e.target.value
);


});


}


}







/* ===============================
   CARREGAR FILMES
================================ */


async function carregarCatalogo(){


try{


console.log(
"🎬 Buscando filmes..."
);



const filmesRef =
collection(db,"filmes");



const filmesSnapshot =
await getDocs(filmesRef);




filmesSnapshot.forEach(
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
"Erro ao buscar filmes:",
error
);


}


}








/* ===============================
   MOSTRAR FILME NA TELA
================================ */


function mostrarFilme(filme){



let local;



if(filme.plano === "FREE"){


local =
document.getElementById(
"freeMovies"
);


}



else if(filme.plano === "PRIME"){


local =
document.getElementById(
"primeMovies"
);


}



else if(filme.plano === "PREMIUM"){


local =
document.getElementById(
"premiumMovies"
);


}



else {


local =
document.getElementById(
"featuredMovies"
);


}





if(!local) return;





const card = document.createElement(
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
${filme.titulo}
</h3>


<span>
${filme.plano || "FREE"}
</span>


</div>

`;





local.appendChild(card);



}
