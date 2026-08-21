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

    // ==========================================
    // SOMENTE POST
    // ==========================================

    if (request.method !== "POST") {
        return jsonResponse(
            {
                success: false,
                error: "Método não permitido."
            },
            405,
            corsHeaders
        );
    }

    try {

        // ==========================================
        // RECEBER DADOS DO SITE
        // ==========================================

        const body = await request.json();

        const uid = body.uid;
        const email = body.email || "";
        const itemId = body.itemId;
        const colecao = body.colecao || "";
        const tag = body.tag || "";
        const valor = Number(body.valor);

        console.log(
            "Dados recebidos do site:",
            {
                uid,
                email,
                itemId,
                colecao,
                tag,
                valor
            }
        );

        // ==========================================
        // VALIDAÇÃO DO USUÁRIO
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

        // ==========================================
        // VALIDAÇÃO DO PRODUTO
        // ==========================================

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

        // ==========================================
        // VALIDAÇÃO DO VALOR
        // ==========================================

        if (!Number.isFinite(valor)) {
            return jsonResponse(
                {
                    success: false,
                    error: "Valor inválido."
                },
                400,
                corsHeaders
            );
        }

        if (valor <= 0) {
            return jsonResponse(
                {
                    success: false,
                    error: "O valor do pagamento deve ser maior que zero."
                },
                400,
                corsHeaders
            );
        }

        // ==========================================
        // HANDLE INFINITEPAY
        // ==========================================

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

        // ==========================================
        // CONVERTER REAIS PARA CENTAVOS
        // ==========================================

        const price = Math.round(
            valor * 100
        );

        if (!Number.isInteger(price) || price <= 0) {

            return jsonResponse(
                {
                    success: false,
                    error: "Valor convertido para centavos é inválido."
                },
                400,
                corsHeaders
            );
        }

        // ==========================================
        // VALOR MÍNIMO ACEITO PELA INFINITEPAY
        //
        // A InfinitePay recusa (422 - "Total price must
        // be greater than 1") valores muito baixos.
        // Usamos R$ 1,00 como piso seguro para nunca
        // mais cair nesse erro genérico.
        // ==========================================

        const PRICE_MINIMO_CENTAVOS = 100; // R$ 1,00

        if (price < PRICE_MINIMO_CENTAVOS) {

            return jsonResponse(
                {
                    success: false,

                    error:
                        "O valor mínimo para pagamento via Pix é R$ 1,00.",

                    valor_recebido:
                        valor
                },
                400,
                corsHeaders
            );
        }

        // ==========================================
        // DESCRIÇÃO DO PRODUTO
        // ==========================================

        let descricao = "V8 Play+";

        if (tag) {
            descricao +=
                ` - Plano ${String(tag).toUpperCase()}`;
        }

        if (itemId) {
            descricao +=
                ` - Item ${String(itemId)}`;
        }

        if (colecao) {
            descricao +=
                ` - ${String(colecao)}`;
        }

        // ==========================================
        // LIMITAR TAMANHO DA DESCRIÇÃO
        // ==========================================

        descricao =
            descricao.substring(0, 200);

        // ==========================================
        // PAYLOAD INFINITEPAY
        //
        // FORMATO:
        //
        // {
        //   "handle": "...",
        //   "items": [
        //      {
        //          "quantity": 1,
        //          "price": 1000,
        //          "description": "Produto"
        //      }
        //   ]
        // }
        //
        // ==========================================

        const payload = {

            handle: handle,

            items: [

                {
                    quantity: 1,

                    price: price,

                    description: descricao
                }

            ]
        };

        // ==========================================
        // LOG DO PAYLOAD
        // ==========================================

        console.log(
            "=========================================="
        );

        console.log(
            "CRIANDO CHECKOUT INFINITEPAY"
        );

        console.log(
            "=========================================="
        );

        console.log(
            JSON.stringify(
                payload,
                null,
                2
            )
        );

        // ==========================================
        // ENVIO PARA INFINITEPAY
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
                        JSON.stringify(
                            payload
                        )
                }
            );

        // ==========================================
        // LER RESPOSTA DA INFINITEPAY
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
        // LOG DA RESPOSTA
        // ==========================================

        console.log(
            "=========================================="
        );

        console.log(
            "RESPOSTA INFINITEPAY"
        );

        console.log(
            "Status:",
            respostaGateway.status
        );

        console.log(
            "Dados:",
            JSON.stringify(
                dadosGateway,
                null,
                2
            )
        );

        console.log(
            "=========================================="
        );

        // ==========================================
        // INFINITEPAY RECUSOU
        // ==========================================

        if (!respostaGateway.ok) {

            console.error(
                "InfinitePay recusou o checkout."
            );

            return jsonResponse(
                {
                    success: false,

                    error:
                        "A InfinitePay recusou a criação do checkout.",

                    status:
                        respostaGateway.status,

                    details:
                        dadosGateway,

                    payload_enviado:
                        payload
                },

                respostaGateway.status,

                corsHeaders
            );
        }

        // ==========================================
        // PROCURAR LINK DO CHECKOUT
        // ==========================================

        const checkoutUrl =

            dadosGateway.url ||

            dadosGateway.checkout_url ||

            dadosGateway.link ||

            dadosGateway.checkoutLink ||

            dadosGateway.checkout_url_web;

        // ==========================================
        // SEM LINK
        // ==========================================

        if (!checkoutUrl) {

            console.error(
                "InfinitePay não retornou URL.",
                dadosGateway
            );

            return jsonResponse(
                {
                    success: false,

                    error:
                        "A InfinitePay criou uma resposta, mas não retornou o link do checkout.",

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

        console.log(
            "Checkout criado com sucesso:"
        );

        console.log(
            checkoutUrl
        );

        // ==========================================
        // RETORNAR PARA O INDEX
        // ==========================================

        return jsonResponse(
            {
                success: true,

                checkout_url:
                    checkoutUrl,

                order_nsu:
                    null,

                amount:
                    price,

                amount_reais:
                    valor,

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

    }

    // ==========================================
    // ERRO GERAL
    // ==========================================

    catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "ERRO INTERNO"
        );

        console.error(
            error
        );

        console.error(
            "=========================================="
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
    corsHeaders
) {

    return new Response(

        JSON.stringify(
            data
        ),

        {
            status: status,

            headers:
                corsHeaders
        }
    );
}
