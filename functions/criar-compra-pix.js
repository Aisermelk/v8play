export async function onRequestPost(context) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { request, env } = context;
        const body = await request.json();
        const { uid, email, itemId, colecao, valor } = body;

        if (!uid || !valor) {
            return new Response(JSON.stringify({ error: "Dados incompletos para gerar o pagamento." }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const valorEmCentavos = Math.round(Number(valor) * 100);

        // CHAMADA REAL À API DO GATEWAY (Exemplo estruturado para InfinitePay / Gateway compatível)
        const respostaGateway = await fetch("https://api.infinitepay.io/v2/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.INFINITEPAY_API_KEY}` // Certifique-se de configurar essa variável no painel do Cloudflare Pages
            },
            body: JSON.stringify({
                amount: valorEmCentavos,
                customer: { email: email || "cliente@v8play.com" },
                metadata: { uid, itemId, colecao }
            })
        });

        const dadosGateway = await respostaGateway.json();

        // Verifica se o gateway retornou o Pix Copia e Cola com sucesso
        if (!respostaGateway.ok || !dadosGateway.pix_code) {
            return new Response(JSON.stringify({ error: "Erro ao gerar o Pix real no gateway de pagamento." }), {
                status: 400,
                headers: corsHeaders
            });
        }

        return new Response(JSON.stringify({
            success: true,
            pix_code: dadosGateway.pix_code, // Código Pix oficial e válido fornecido pelo banco/gateway
            amount: valorEmCentavos
        }), {
            status: 200,
            headers: corsHeaders
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Erro interno no servidor ao processar o Pix." }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
