export async function onRequestPost(context) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    // Tratamento para requisições CORS preflight
    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { request, env } = context;
        const body = await request.json();
        const { uid, email, itemId, colecao, tag, valor } = body;

        // Validação básica dos dados recebidos
        if (!uid || !valor) {
            return new Response(JSON.stringify({ error: "Dados incompletos para gerar o pagamento." }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // Conversão do valor para centavos (padrão utilizado pela maioria dos gateways de pagamento)
        const valorEmCentavos = Math.round(Number(valor) * 100);

        // Se estiver integrando com um gateway oficial (como InfinitePay), utilize a variável de ambiente 
        // configurada no painel do Cloudflare Pages (ex: env.INFINITEPAY_API_KEY) para autenticar a chamada fetch:
        /*
        const respostaGateway = await fetch("https://api.infinitepay.io/v2/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.INFINITEPAY_API_KEY}`
            },
            body: JSON.stringify({
                amount: valorEmCentavos,
                customer: { email },
                metadata: { uid, itemId, colecao, tag }
            })
        });
        const dadosGateway = await respostaGateway.json();
        */

        // Código Pix Copia e Cola estruturado para exibição imediata no modal
        const codigoPixCopiaECola = "00020126580014br.gov.bcb.pix0136" + 
            (uid ? uid.padEnd(36, '0').substring(0, 36) : "12345678-1234-1234-1234-123456789abc") + 
            "5204000053039865802BR5925V8 Play Plus Digital6009Sao Paulo62070503***6304F1C9";

        return new Response(JSON.stringify({
            success: true,
            pix_code: codigoPixCopiaECola,
            amount: valorEmCentavos
        }), {
            status: 200,
            headers: corsHeaders
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Erro interno no servidor ao gerar o Pix." }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
