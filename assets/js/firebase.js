/* =====================================
   V8 PLAY+
   FIREBASE.JS
   Conexão Firebase
===================================== */


/* Firebase SDK */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";


import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


import { getAuth }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


import { getStorage }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";





/* CONFIGURAÇÃO FIREBASE */


const firebaseConfig = {


apiKey: "AIzaSyCj00E3qCzJJEIFnTVcvRC97f4HgERvaoI",

authDomain: "v8-play.firebaseapp.com",

projectId: "v8-play",

storageBucket: "v8-play.firebasestorage.app",

messagingSenderId: "593432751068",

appId: "1:593432751068:web:8ca518d66d43ae2fb77d19",

measurementId: "G-7C60RJTW8S"


};





/* INICIAR FIREBASE */


const app = initializeApp(firebaseConfig);





/* SERVIÇOS */


const db = getFirestore(app);


const auth = getAuth(app);


const storage = getStorage(app);





/* EXPORTAR */


export {

app,

db,

auth,

storage

};



console.log(
"🔥 Firebase conectado ao V8 Play+"
);
