const axios = require('axios');

const url = "http://192.168.0.133:8082/";
const token = "4fce25f1-457e-41e0-8b53-b9f4b950d7c4"; // Remplacez par votre token

axios.post(url, {
    to: "+10000000000",
    message: "Test SMS"
}, {
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    }
})
.then(response => {
    console.log("SMS envoyé avec succès :", response.data);
})
.catch(error => {
    if (error.response) {
        console.error("❌ Erreur lors de l'envoi du SMS !");
        console.error("📌 Status:", error.response.status);
        console.error("📌 Réponse API:", error.response.data);
    } else if (error.request) {
        console.error("❌ Aucune réponse de l'API. Vérifiez si Traccar SMS Gateway tourne bien.");
    } else {
        console.error("❌ Erreur inconnue :", error.message);
    }
});
