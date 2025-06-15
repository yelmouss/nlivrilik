/**
 * Utilitaires de validation pour le formulaire de commande
 */

/**
 * Valide les informations de contact
 * @param {Object} contactInfo - Informations de contact
 * @param {Function} t - Fonction de traduction
 * @returns {string|null} Message d'erreur ou null si valide
 */
export const validateContactInfo = (contactInfo, t) => {
  const { fullName, email, phoneNumber } = contactInfo;

  if (!fullName || !email || !phoneNumber) {
    return t("pleaseCompleteAllFields");
  }

  // Validation simple de l'email
  if (!/\S+@\S+\.\S+/.test(email)) {
    return t("invalidEmailFormat");
  }

  // Validation simple du numéro de téléphone
  if (!/^\+?[0-9\s]{8,15}$/.test(phoneNumber.replace(/[\s()-]/g, ""))) {
    return t("invalidPhoneFormat");
  }

  return null;
};

/**
 * Valide l'adresse de livraison
 * @param {Object} deliveryInfo - Informations de livraison
 * @param {Function} t - Fonction de traduction
 * @returns {string|null} Message d'erreur ou null si valide
 */
export const validateDeliveryAddress = (deliveryInfo, t) => {
  const { address, coordinates } = deliveryInfo;

  if (!address || (coordinates[0] === 0 && coordinates[1] === 0)) {
    return t("pleaseSelectDeliveryAddress");
  }

  return null;
};

/**
 * Valide le contenu de la commande
 * @param {string} orderContent - Contenu de la commande
 * @param {Function} t - Fonction de traduction
 * @returns {string|null} Message d'erreur ou null si valide
 */
export const validateOrderContent = (orderContent, t) => {
  if (!orderContent) {
    return t("pleaseEnterOrderDetails");
  }

  return null;
};

/**
 * Valide une étape spécifique du formulaire
 * @param {number} step - Numéro de l'étape
 * @param {Object} formData - Données du formulaire
 * @param {Function} t - Fonction de traduction
 * @returns {string|null} Message d'erreur ou null si valide
 */
export const validateStep = (step, formData, t) => {
  switch (step) {
    case 0:
      return validateContactInfo({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      }, t);
    
    case 1:
      return validateDeliveryAddress({
        address: formData.address,
        coordinates: formData.coordinates,
      }, t);
    
    case 2:
      return validateOrderContent(formData.orderContent, t);
    
    default:
      return null;
  }
};
