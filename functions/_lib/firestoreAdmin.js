// Helper para converter tipos do JS para a estrutura de dados exigida pela API REST do Firestore
function serializarCampos(dados) {
    const fields = {};
    for (const [chave, valor] of Object.entries(dados)) {
        if (typeof valor === "string") {
            fields[chave] = { stringValue: valor };
        } else if (typeof valor === "number") {
            fields[chave] = Number.isInteger(valor)
                ? { integerValue: String(valor) }
                : { doubleValue: valor };
        } else if (typeof valor === "boolean") {
            fields[chave] = { booleanValue: valor };
        } else if (valor instanceof Date) {
            fields[chave] = { timestampValue: valor.toISOString() };
        } else if (valor === null) {
            fields[chave] = { nullValue: null };
        } else if (typeof valor === "object") {
            fields[chave] = { stringValue: JSON.stringify(valor) };
        }
    }
    return fields;
}

// Helper para converter a resposta da API REST do Firestore em objeto JavaScript simples
function deserializarCampos(fields) {
    if (!fields) return {};
    const obj = {};
    for (const [chave, valor] of Object.entries(fields)) {
        if ("stringValue" in valor) obj[chave] = valor.stringValue;
        else if ("integerValue" in valor) obj[chave] = parseInt(valor.integerValue, 10);
        else if ("doubleValue" in valor) obj[chave] = parseFloat(valor.doubleValue);
        else if ("booleanValue" in valor) obj[chave] = valor.booleanValue;
        else if ("timestampValue" in valor) obj[chave] = valor.timestampValue;
        else if ("nullValue" in valor) obj[chave] = null;
    }
    return obj;
}

/**
 * Leitura de documento no Firestore via API REST
 * @param {Object} env Variáveis de ambiente da Cloudflare (FIREBASE_PROJECT_ID e FIREBASE_API_KEY)
 * @param {string} caminho Ex: "filmes/ID_DO_FILME"
 */
export async function lerDocumento(env, caminho) {
    const projectId = env.FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${caminho}?key=${apiKey}`;

    const resposta = await fetch(url);
    if (!resposta.ok) {
        if (resposta.status === 404) return null;
        throw new Error(`Erro ao consultar Firestore API: ${resposta.statusText}`);
    }

    const json = await resposta.json();
    return {
        id: json.name.split("/").pop(),
        ...deserializarCampos(json.fields)
    };
}

/**
 * Escrita/Atualização de documento no Firestore via API REST
 * @param {Object} env Variáveis de ambiente da Cloudflare
 * @param {string} caminho Ex: "compras/UID_ITEMID"
 * @param {Object} dados Objeto com as informações a serem salvas
 */
export async function gravarDocumento(env, caminho, dados) {
    const projectId = env.FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${caminho}?key=${apiKey}`;

    const corpo = { fields: serializarCampos(dados) };

    const resposta = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    });

    if (!resposta.ok) {
        const erroTexto = await resposta.text();
        throw new Error(`Erro ao gravar no Firestore API: ${erroTexto}`);
    }

    return await resposta.json();
}