/* =====================================
   V8 PLAY+
   APP.JS
===================================== */

/* ===============================
   FIREBASE
================================ */

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


console.log("🔥 Firebase conectado ao V8 Play+");
console.log("🚀 V8 Play+ iniciado");


/* ===============================
   INICIALIZAÇÃO
================================ */

document.addEventListener("DOMContentLoaded", () => {

    console.log("✅ Página carregada");

    iniciarSite();

});


/* ===============================
   INICIAR SISTEMA
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

    const loginBtn = document.getElementById("loginBtn");

    if(loginBtn){

        loginBtn.addEventListener("click", () => {

            alert("Login V8 Play+ em desenvolvimento");

        });

    }

}


/* ===============================
   PESQUISA
================================ */

function configurarPesquisa(){

    const searchInput = document.getElementById("searchInput");

    if(!searchInput) return;

    searchInput.addEventListener("input",(e)=>{

        const busca = e.target.value.toLowerCase();

        document.querySelectorAll(".movie-card").forEach(card=>{

            const titulo = card.querySelector("h3").innerText.toLowerCase();

            card.style.display =
                titulo.includes(busca)
                ? "block"
                : "none";

        });

    });

}


/* ===============================
   CARREGAR FILMES
================================ */

async function carregarCatalogo(){

    try{

        console.log("🎬 Buscando filmes...");

        const filmesRef = collection(db,"filmes");

        const snapshot = await getDocs(filmesRef);

        if(snapshot.empty){

            console.warn("⚠ Nenhum filme encontrado.");

            return;

        }

        snapshot.forEach((doc)=>{

            const filme = doc.data();

            console.log("🎥 Filme encontrado:",filme.titulo);

            mostrarFilme(filme);

        });

    }

    catch(error){

        console.error("❌ Erro ao buscar filmes:",error);

    }

}


/* ===============================
   MOSTRAR FILME
================================ */

function mostrarFilme(filme){

    let local;

    switch(filme.plano){

        case "FREE":
            local = document.getElementById("freeMovies");
            break;

        case "PRIME":
            local = document.getElementById("primeMovies");
            break;

        case "PREMIUM":
            local = document.getElementById("premiumMovies");
            break;

        default:
            local = document.getElementById("featuredMovies");
            break;

    }

    if(!local){
        console.error("❌ Área do catálogo não encontrada.");
        return;
    }

    const card = document.createElement("div");

    card.className = "movie-card";

    card.innerHTML = `
        <img
            src="${filme.capa || 'assets/img/default.jpg'}"
            alt="${filme.titulo}"
        >

        <div class="movie-info">

            <h3>${filme.titulo || "Sem título"}</h3>

            <span>${filme.plano || "FREE"}</span>

            <button
                type="button"
                class="watch-btn">
                ▶ Assistir
            </button>

        </div>
    `;

    // Clique no card inteiro
    card.addEventListener("click", () => {

        console.log("🟢 CARD CLICADO");

        abrirPlayer(filme);

    });

    // Clique somente no botão
    const botao = card.querySelector(".watch-btn");

    botao.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        console.log("🟢 BOTÃO CLICADO");

        abrirPlayer(filme);

    });

    local.appendChild(card);

}

/* ===============================
   ABRIR PLAYER
================================ */

function abrirPlayer(filme){

    try{

        console.log("▶ Abrindo Player");

        console.log(filme);

        localStorage.setItem(
            "filmeAtual",
            JSON.stringify(filme)
        );

        console.log(
            "💾 Filme salvo:",
            localStorage.getItem("filmeAtual")
        );

        window.location.assign("player.html");

    }

    catch(error){

        console.error("❌ Erro ao abrir o player:",error);

    }

}
