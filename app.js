const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { createCanvas } = require('canvas'); // Para gerar o "print" da redação

const app = express();
app.use(bodyParser.json());

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'seuemail@gmail.com',  // Substitua pelo seu e-mail
        pass: 'suasenha',            // Substitua pela sua senha
    }
});

function generateImage(redacao, tema, dataHora) {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`Tema: ${tema}`, 50, 50);
    ctx.fillText(`Data: ${dataHora}`, 50, 80);
    ctx.fillText('Redação:', 50, 120);

    let lines = redacao.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, 50, 150 + index * 25);
    });

    return canvas.toBuffer();
}

app.post('/send-email', (req, res) => {
    const { tema, redacao, dataHora } = req.body;

    // Gerando o "print" da redação
    const redacaoImage = generateImage(redacao, tema, dataHora);

    const mailOptions = {
        from: 'seuemail@gmail.com',
        to: 'impulseone1.0@gmail.com', // Destinatário
        subject: `Nova Redação - Tema: ${tema}`,
        text: `Tema: ${tema}\nData e Hora: ${dataHora}\n\nRedação: \n${redacao}`,
        attachments: [
            {
                filename: 'redacao.png',
                content: redacaoImage,
                contentType: 'image/png'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false });
        }
        console.log('Email enviado: ' + info.response);
        return res.status(200).json({ success: true });
    });
});

// Iniciando o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
