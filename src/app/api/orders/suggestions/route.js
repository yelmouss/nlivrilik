import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        message: 'Aucun texte fourni pour la suggestion'
      }, { status: 400 });
    }
    
    // Pour cet exemple, nous utilisons une API locale simple de suggestions
    // Dans un environnement de production, vous pourriez utiliser OpenAI ou une autre API d'IA
    const suggestions = generateSuggestions(prompt);
    
    return NextResponse.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Erreur lors de la génération de suggestions:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Fonction simple de génération de suggestions
// Dans un environnement réel, cela serait remplacé par un appel à une API d'IA
function generateSuggestions(prompt) {
  // Liste de produits et articles courants
  const commonItems = [
    "pain", "lait", "eau", "jus d'orange", "pommes", "bananes", "riz", "pâtes",
    "poulet", "bœuf", "poisson", "tomates", "oignons", "carottes", "salade",
    "fromage", "yaourt", "œufs", "beurre", "huile d'olive", "sel", "poivre",
    "farine", "sucre", "café", "thé", "chocolat", "biscuits", "céréales",
    "mouchoirs", "papier toilette", "savon", "shampooing", "dentifrice"
  ];
  
  // Convertir le prompt en minuscules pour une correspondance insensible à la casse
  const lowercasePrompt = prompt.toLowerCase();
  
  // Filtrer les éléments qui pourraient être pertinents en fonction du texte saisi
  const relevantItems = commonItems.filter(item => 
    !lowercasePrompt.includes(item.toLowerCase()) && 
    (item.includes(lowercasePrompt) || lowercasePrompt.includes(item.substring(0, Math.min(3, item.length))))
  );
  
  // Sélectionner jusqu'à 5 suggestions
  return relevantItems.slice(0, 5);
}
