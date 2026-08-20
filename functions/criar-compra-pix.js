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
        // RECEBER DADOS
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

        if (
            valor === undefined ||
            valor === null ||
            valor === ""
        ) {
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
        // CENTAVOS
        // ==========================================

        const valorEmCentavos =
            Math.round(valorNumerico * 100);


        // ==========================================
        // INFINITEPAY HANDLE
        // ==========================================

        let handle =
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
                        "Configure INFINITEPAY_HANDLE no Cloudflare."
                },
                500,
                corsHeaders
            );
        }


        /*
         * Remove espaços acidentais
         * e o símbolo $ caso tenha sido colocado.
         */

        handle =
            String(handle)
                .trim()
                .replace(/^\$/, "");


        if (!handle) {

            return jsonResponse(
                {
                    success: false,
                    error:
                        "InfiniteTag inválida."
                },
                500,
                corsHeaders
            );
        }


        // ==========================================
        // ORDER NSU
        // ==========================================

        const orderNsu =
            `V8-${Date.now()}-${crypto.randomUUID()}`;


        // ==========================================
        // URL DO SITE
        // ==========================================

        const requestUrl =
            new URL(request.url);


        const siteUrl =
            env.SITE_URL ||
            `${requestUrl.protocol}//${requestUrl.host}`;


        // ==========================================
        // URLs
        // ==========================================

        const redirectUrl =
            `${siteUrl}/pagamento-concluido`;


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
                ` - Item ${String(itemId)}`;

        }


        // ==========================================
        // PAYLOAD
        // ==========================================

        const payload = {

            handle: handle,

            order_nsu: orderNsu,

            redirect_url: redirectUrl,

            webhook_url: webhookUrl,

            items: [
                {
                    quantity: 1,

                    price:
                        valorEmCentavos,

                    description:
                        descricao
                }
            ]
        };


        // ==========================================
        // CLIENTE
        // ==========================================

        if (email) {

            payload.customer = {
                email: String(email).trim()
            };

        }


        // ==========================================
        // LOG
        // ==========================================

        console.log(
            "=========================================="
        );

        console.log(
            "CRIANDO CHECKOUT INFINITEPAY"
        );

        console.log(
            "HANDLE:",
            handle
        );

        console.log(
            "VALOR:",
            valorEmCentavos
        );

        console.log(
            "ORDER NSU:",
            orderNsu
        );

        console.log(
            "PAYLOAD:",
            JSON.stringify(payload)
        );

        console.log(
            "=========================================="
        );


        // ==========================================
        // CHAMADA INFINITEPAY
        // ==========================================

        const respostaGateway =
            await fetch(
                "https://api.checkout.infinitepay.io/links",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        // ==========================================
        // RESPOSTA
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


        console.log(
            "STATUS INFINITEPAY:",
            respostaGateway.status
        );


        console.log(
            "RESPOSTA INFINITEPAY:",
            JSON.stringify(dadosGateway)
        );


        // ==========================================
        // ERRO
        // ==========================================

        if (!respostaGateway.ok) {

            return jsonResponse(
                {
                    success: false,

                    error:
                        "A InfinitePay recusou a criação do checkout.",

                    status:
                        respostaGateway.status,

                    details:
                        dadosGateway,

                    enviado: {
                        handle:
                            handle,

                        order_nsu:
                            orderNsu,

                        amount:
                            valorEmCentavos,

                        description:
                            descricao
                    }
                },
                400,
                corsHeaders
            );
        }


        // ==========================================
        // LINK DO CHECKOUT
        // ==========================================

        const checkoutUrl =
            dadosGateway.url ||
            dadosGateway.checkout_url ||
            dadosGateway.link;


        if (!checkoutUrl) {

            console.error(
                "Checkout sem URL:",
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
        // SUCESSO
        // ==========================================

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
            "ERRO INTERNO:",
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
