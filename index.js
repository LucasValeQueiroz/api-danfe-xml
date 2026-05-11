const express = require('express');
const { DANFe } = require('node-sped-pdf');

const app = express();

app.use(express.text({ type: 'application/xml', limit: '10mb' }));
app.use(express.text({ type: 'text/xml', limit: '10mb' }));

// ==========================================
// BARREIRA DE SEGURANÇA: CHAVE DE API
// ==========================================
// Você pode definir essa variável no painel do Render (Environment Variables)
// ou deixar um valor fixo aqui para testar.
const MINHA_CHAVE_SECRETA = process.env.API_KEY ;

app.use((req, res, next) => {
    const chaveEnviada = req.headers['x-api-key'];
    if (chaveEnviada !== MINHA_CHAVE_SECRETA) {
        console.log("Tentativa de acesso bloqueada!");
        return res.status(401).send('Acesso Negado: Chave de API inválida.');
    }
    next(); // Se a senha bater, deixa passar!
});
// ==========================================

app.post('/api/gerar-pdf', async (req, res) => {
    try {
        const xmlString = req.body;
        
        if (!xmlString || typeof xmlString !== 'string') {
            return res.status(400).send('XML inválido.');
        }

        const pdfArrayBuffer = await DANFe({ xml: xmlString });
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        
        res.contentType("application/pdf");
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        res.status(500).send("Erro interno ao processar a NF-e.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Microserviço seguro rodando na porta ${PORT}`);
});