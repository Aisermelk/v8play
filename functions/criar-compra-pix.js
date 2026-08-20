export async function onRequestPost(context) {
    const { request, env } = context;

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    // ==============================
    // CORS
    // ==============================

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    try {
        // ==============================
        // RECEBE OS DADOS DO SITE
        // ==============================

        const body = await request.json();

        const uid = body.uid;
        const email = body.email;
        const itemId = body.itemId;
        const colecao = body.colecao;
        const valor = body.valor;

        // ==============================
        // VALIDAÇÃO
        // ==============================

        if (!uid) {
            return jsonResponse(
                {
                    success: false,
                    error: "Usuário não informado."
                },
                400,
                corsHeaders
            );
        }

        if (!valor) {
            return jsonResponse(
                {
                    success: false,
                    error: "Valor não informado."
                },
                400,
                corsHeaders
            );
        }

        const valorNumerico = Number(valor);

        if (
            !Number.isFinite(valorNumerico) ||
            valorNumerico <= 0
        ) {
            return jsonResponse(
                {
                    success: false,
                    error: "Valor do pagamento inválido."
                },
                400,
                corsHeaders
            );
        }

        // ==============================
        // CONVERTE PARA CENTAVOS
        // ==============================

        const valorEmCentavos = Math.round(
            valorNumerico * 100
        );

        // ==============================
        // CONFIGURAÇÃO INFINITEPAY
        // ==============================

        /*
         * Configure no Cloudflare:
         *
         * INFINITEPAY_HANDLE
         *
         * Exemplo:
         *
         * INFINITEPAY_HANDLE = minha_infinite_tag
         *
         * NÃO coloque o símbolo $
         */

        const handle = env.INFINITEPAY_HANDLE;

        if (!handle) {
            console.error(
                "INFINITEPAY_HANDLE não configurado."
            );

            return jsonResponse(
                {
                    success: false,
                    error:
                        "InfinitePay não configurada no servidor.",
                    details:
                        "Configure a variável INFINITEPAY_HANDLE no Cloudflare."
                },
                500,
                corsHeaders
            );
        }

        // ==============================
        // GERA IDENTIFICADOR DO PEDIDO
        // ==============================

        const orderNsu = [
            "V8",
            Date.now(),
            crypto.randomUUID()
        ].join("-");

        // ==============================
        // URL DO SITE
        // ==============================

        const url = new URL(request.url);

        const siteUrl =
            env.SITE_URL ||
            `${url.protocol}//${url.host}`;

        /*
         * Página para onde o cliente volta
         * depois de finalizar o pagamento.
         */

        const redirectUrl =
            `${siteUrl}/pagamento-concluido`;

        /*
         * Endpoint que futuramente receberá
         * a confirmação automática.
         */

        const webhookUrl =
            `${siteUrl}/webhook-infinitepay`;

        // ==============================
        // DESCRIÇÃO DO PRODUTO
        // ==============================

        let descricao = "Acesso V8+";

        if (itemId) {
            descricao = `Acesso V8+ - ${itemId}`;
        }

        if (colecao) {
            descricao += ` - ${colecao}`;
        }

        // ==============================
        // PAYLOAD INFINITEPAY
        // ==============================

        const payload = {
            handle: handle,

            order_nsu: orderNsu,

            redirect_url: redirectUrl,

            webhook_url: webhookUrl,

            items: [
                {
                    quantity: 1,
                    price: valorEmCentavos,
                    description: descricao
                }
            ]
        };

        // ==============================
        // DADOS DO CLIENTE
        // ==============================

        if (email) {
            payload.customer = {
                email: email
            };
        }

        // ==============================
        // ENVIA PARA A INFINITEPAY
        // ==============================

        console.log(
            "Criando checkout InfinitePay:",
            {
                order_nsu: orderNsu,
                valor: valorEmCentavos,
                itemId: itemId,
                colecao: colecao
            }
        );

        const respostaGateway = await fetch(
            "https://api.checkout.infinitepay.io/links",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        // ==============================
        // LÊ RESPOSTA
        // ==============================

        const respostaTexto =
            await respostaGateway.text();

        let dadosGateway;

        try {
            dadosGateway =
                JSON.parse(respostaTexto);
        } catch {
            dadosGateway = {
                raw: respostaTexto
            };
        }

        // ==============================
        // ERRO DA INFINITEPAY
        // ==============================

        if (!respostaGateway.ok) {

            console.error(
                "InfinitePay retornou erro:",
                respostaGateway.status,
                dadosGateway
            );

            return jsonResponse(
                {
                    success: false,
                    error:
                        "A InfinitePay não conseguiu criar o checkout.",
                    status:
                        respostaGateway.status,
                    details: dadosGateway
                },
                400,
                corsHeaders
            );
        }

        // ==============================
        // PEGA URL DO CHECKOUT
        // ==============================

        const checkoutUrl =
            dadosGateway.url;

        if (!checkoutUrl) {

            console.error(
                "InfinitePay não retornou URL:",
                dadosGateway
            );

            return jsonResponse(
                {
                    success: false,
                    error:
                        "A InfinitePay não retornou o link de pagamento.",
                    details: dadosGateway
                },
                502,
                corsHeaders
            );
        }

        // ==============================
        // RESPOSTA PARA O FRONTEND
        // ==============================

        return jsonResponse(
            {
                success: true,

                checkout_url:
                    checkoutUrl,

                order_nsu:
                    orderNsu,

                amount:
                    valorEmCentavos,

                amount_reais:
                    valorNumerico,

                uid:
                    uid,

                itemId:
                    itemId || null,

                colecao:
                    colecao || null
            },
            200,
            corsHeaders
        );

    } catch (error) {

        console.error(
            "Erro interno em criar-compra-pix:",
            error
        );

        return jsonResponse(
            {
                success: false,
                error:
                    "Erro interno ao criar o pagamento.",
                details:
                    error?.message ||
                    String(error)
            },
            500,
            corsHeaders
        );
    }
}


// ==========================================
// FUNÇÃO AUXILIAR DE RESPOSTA JSON
// ==========================================

function jsonResponse(
    data,
    status,
    headers
) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers
        }
    );
}
