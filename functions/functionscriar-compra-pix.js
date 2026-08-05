import { lerDocumento } from "./_lib/firestoreAdmin.js";

export async function onRequestPost({ request, env }) {
    try {
        const { uid, email, itemId, colecao } = await request.json();

        if (!uid || !email || !itemId || !colecao) {
            return new Response(JSON.stringify({ error: "Parâmetros incompletos" }), { status: 400 });
        }

        const item = await lerDocumento(env, `${colecao}/${itemId}`);
        if (!item) {
            return new Response(JSON.stringify({ error: "Item não encontrado" }), { status: 404 });
        }

        const valorEmCentavos = Math.round((Number(item.preco) || 0) * 100);
        if (valorEmCentavos <= 0) {
            return new Response(JSON.stringify({ error: "Este item é gratuito" }), { status: 400 });
        }

        // Requisição para gerar o Pix na InfinitePay
        const resposta = await fetch("https://api.infinitepay.io/v2/transactions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.INFINITEPAY_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: valorEmCentavos,
                payment_method: "pix",
                metadata: {
                    usuario_uid: uid,
                    item_id: itemId,
                    colecao: colecao
                }
            })
        });

        const dados = await resposta.json();

        return new Response(JSON.stringify({ 
            pix_code: dados.br_code || dados.pix_copy_paste || "00020126580014br.gov.bcb.pix..."
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (erro) {
        console.error("Erro no Pix InfinitePay:", erro);
        return new Response(JSON.stringify({ error: "Erro interno ao gerar o Pix" }), { status: 500 });
    }
}