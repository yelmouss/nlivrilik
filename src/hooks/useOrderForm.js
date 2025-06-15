import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const DEBOUNCE_DELAY = 300; // ms

export const useOrderForm = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("Order");
  
  // Références
  const orderContentRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // États du formulaire
  const [activeStep, setActiveStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [additionalAddressInfo, setAdditionalAddressInfo] = useState("");
  const [orderContent, setOrderContent] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Étapes du formulaire
  const steps = [
    t("step1ContactInfo"),
    t("step2DeliveryAddress"),
    t("step3OrderDetails"),
    t("step4Confirmation"),
  ];

  // Remplir les champs si l'utilisateur est connecté
  useEffect(() => {
    if (status === "authenticated" && session.user) {
      if (session.user.name) setFullName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
    }
  }, [status, session]);

  // Fonction pour obtenir des suggestions basées sur le texte saisi
  const fetchSuggestions = async (text) => {
    if (!text || text.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const response = await fetch("/api/orders/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Fonction de debounce pour les suggestions
  const handleOrderContentChange = (e) => {
    const text = e.target.value;
    setOrderContent(text);

    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Configurer un nouveau timer
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, DEBOUNCE_DELAY);
  };

  // Fonction pour ajouter une suggestion au contenu de la commande
  const addSuggestionToOrder = (suggestion) => {
    const newContent = orderContent
      ? `${orderContent}, ${suggestion}`
      : suggestion;
    setOrderContent(newContent);

    // Mettre le focus sur le champ de texte et positionner le curseur à la fin
    if (orderContentRef.current) {
      orderContentRef.current.focus();
      orderContentRef.current.setSelectionRange(
        newContent.length,
        newContent.length
      );
    }

    // Afficher un message de confirmation
    setSnackbarMessage(`${suggestion} ${t("addedToOrder")}`);
    setSnackbarOpen(true);
  };

  // Fonction pour mettre à jour les coordonnées depuis la carte
  const handleMapLocationSelect = (location) => {
    setCoordinates(location.coordinates);
    setAddress(location.formattedAddress);
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const orderData = {
        contactInfo: {
          fullName,
          email,
          phoneNumber,
        },
        deliveryAddress: {
          formattedAddress: address,
          coordinates: {
            type: "Point",
            coordinates,
          },
          additionalInfo: additionalAddressInfo,
        },
        orderContent,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirection vers la page des commandes après 2 secondes
        setTimeout(() => {
          router.push("/my-orders");
        }, 2000);
      } else {
        setError(data.message || t("errorCreatingOrder"));
      }
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      setError(t("errorCreatingOrder"));
    } finally {
      setLoading(false);
    }
  };

  // Fermeture du snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return {
    // État
    activeStep,
    fullName,
    email,
    phoneNumber,
    address,
    coordinates,
    additionalAddressInfo,
    orderContent,
    suggestions,
    loading,
    error,
    success,
    snackbarOpen,
    snackbarMessage,
    loadingSuggestions,
    steps,
    orderContentRef,

    // Setters
    setActiveStep,
    setFullName,
    setEmail,
    setPhoneNumber,
    setAddress,
    setCoordinates,
    setAdditionalAddressInfo,
    setError,

    // Handlers
    handleOrderContentChange,
    addSuggestionToOrder,
    handleMapLocationSelect,
    handleSubmit,
    handleSnackbarClose,
  };
};
