/* =====================================
   V8 PLAY+
   APP.JS
   Sistema principal
===================================== */


console.log("🚀 V8 Play+ iniciado");



/*
=====================================
CONFIGURAÇÃO INICIAL
=====================================
*/


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"✅ Página carregada corretamente"
);



iniciarSite();


});





/*
=====================================
FUNÇÃO PRINCIPAL
=====================================
*/


function iniciarSite(){


configurarLogin();

configurarPesquisa();


}




/*
=====================================
LOGIN
=====================================
*/


function configurarLogin(){


const loginBtn =
document.getElementById("loginBtn");



if(loginBtn){


loginBtn.addEventListener(
"click",
()=>{


alert(
"Área de login será ativada em breve"
);


});


}



}





/*
=====================================
PESQUISA
=====================================
*/


function configurarPesquisa(){


const searchInput =
document.getElementById("searchInput");



if(searchInput){


searchInput.addEventListener(
"keyup",
(e)=>{


console.log(
"Pesquisa:",
e.target.value
);


});


}



}
