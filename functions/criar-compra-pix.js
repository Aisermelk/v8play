export async function onRequestPost(context) {
    const { request, env } = context;

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    // ==========================================
    // CORS
    // ==========================================

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    try {
        // ==========================================
        // RECEBE OS DADOS DO SITE
        // ==========================================

        const body = await request.json();

        const uid = body.uid;
        const email = body.email;
        const itemId = body.itemId;
        const colecao = body.colecao;
        const tag = body.tag;
        const valor = body.valor;

        // ==========================================
        // VALIDAÇÕES
        // ==========================================

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

        if (!itemId) {
            return jsonResponse(
                {
                    success: false,
                    error: "Produto não informado."
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

        // ==========================================
        // CONVERTE REAIS PARA CENTAVOS
        // ==========================================

        const valorEmCentavos = Math.round(
            valorNumerico * 100
        );

        // ==========================================
        // CONFIGURAÇÃO INFINITEPAY
        // ==========================================

        const handle =
            env.INFINITEPAY_HANDLE;

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
                        "Configure INFINITEPAY_HANDLE nas variáveis do Cloudflare."
                },
                500,
                corsHeaders
            );
        }

        // ==========================================
        // IDENTIFICADOR ÚNICO DA COMPRA
        // ==========================================

        const orderNsu = [
            "V8",
            Date.now(),
            crypto.randomUUID()
        ].join("-");

        // ==========================================
        // URL DO SITE
        // ==========================================

        const requestUrl =
            new URL(request.url);

        const siteUrl =
            env.SITE_URL ||
            `${requestUrl.protocol}//${requestUrl.host}`;

        // ==========================================
        // URL DE RETORNO
        // ==========================================

        const redirectUrl =
            `${siteUrl}/pagamento-concluido`;

        // ==========================================
        // WEBHOOK
        // ==========================================

        const webhookUrl =
            `${siteUrl}/webhook-infinitepay`;

        // ==========================================
        // DESCRIÇÃO
        // ==========================================

        let descricao =
            "Acesso V8 Play+";

        if (tag) {
            descricao +=
                ` - Plano ${String(tag).toUpperCase()}`;
        }

        if (itemId) {
            descricao +=
                ` - Item ${itemId}`;
        }

        if (colecao) {
            descricao +=
                ` - ${colecao}`;
        }

        // ==========================================
        // PAYLOAD INFINITEPAY
        // ==========================================

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

        // ==========================================
        // CLIENTE
        // ==========================================

        if (email) {
            payload.customer = {
                email: email
            };
        }

        // ==========================================
        // LOG
        // ==========================================

        console.log(
            "Criando checkout InfinitePay:",
            {
                order_nsu: orderNsu,
                valor: valorEmCentavos,
                uid: uid,
                email: email || null,
                itemId: itemId,
                colecao: colecao || null,
                tag: tag || null
            }
        );

        // ==========================================
        // ENVIA PARA INFINITEPAY
        // ==========================================

        const respostaGateway =
            await fetch(
                "https://api.checkout.infinitepay.io/links",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );

        // ==========================================
        // LÊ RESPOSTA
        // ==========================================

        const respostaTexto =
            await respostaGateway.text();

        let dadosGateway;

        try {
            dadosGateway =
                JSON.parse(
                    respostaTexto
                );
        } catch {
            dadosGateway = {
                raw:
                    respostaTexto
            };
        }

        // ==========================================
        // ERRO INFINITEPAY
        // ==========================================

        if (!respostaGateway.ok) {

    console.error(
        "InfinitePay retornou erro:",
        respostaGateway.status,
        dadosGateway
    );

    return jsonResponse(
        {
            success: false,
            error: "A InfinitePay recusou a criação do checkout.",
            status: respostaGateway.status,
            details: dadosGateway
        },
        400,
        corsHeaders
    );
}
        // ==========================================
        // OBTÉM LINK DO CHECKOUT
        // ==========================================

        const checkoutUrl =
            dadosGateway.url ||
            dadosGateway.checkout_url ||
            dadosGateway.link;

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

                    details:
                        dadosGateway
                },
                502,
                corsHeaders
            );
        }

        // ==========================================
        // RESPOSTA PARA O SITE
        // ==========================================

        /*
         * IMPORTANTE:
         *
         * O seu index.html espera:
         *
         * dados.pix_code
         *
         * Entretanto, a resposta dessa integração
         * é um checkout da InfinitePay.
         *
         * Portanto enviamos também checkout_url.
         */

        return jsonResponse(
            {
                success: true,

                checkout_url:
                    checkoutUrl,

                pix_code:
                    checkoutUrl,

                order_nsu:
                    orderNsu,

                amount:
                    valorEmCentavos,

                amount_reais:
                    valorNumerico,

                uid:
                    uid,

                email:
                    email || null,

                itemId:
                    itemId,

                colecao:
                    colecao || null,

                tag:
                    tag || null
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
// RESPOSTA JSON
// ==========================================

function jsonResponse(
    data,
    status,
    headers
) {
    return new Response(
        JSON.stringify(data),
        {
            status: status,

            headers: headers
        }
    );
}
