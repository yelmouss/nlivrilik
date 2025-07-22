'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import './maintenance.css';

// Import dynamique de Lottie pour éviter les erreurs SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function MaintenancePage() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Charger l'animation Lottie
    fetch('/AnimationServices.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Erreur lors du chargement de l\'animation:', error));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 maintenance-container">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center"
      >
      
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 maintenance-card"
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 pulse-animation">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.415-3.414l5-5A2 2 0 008 10.172V5L8 4z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              🚧 Site en maintenance 🚧
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Nous améliorons actuellement nos services pour vous offrir une meilleure expérience. 
              Notre équipe travaille dur pour remettre le site en ligne le plus rapidement possible.
            </p>
          </div>

          {/* Informations de contact */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🆘 Besoin d&apos;aide urgente ? Contactez yelmouss devt
            </h3>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:yelmouss.devt@gmail.com"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium contact-button"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.026a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                📧 yelmouss.devt@gmail.com
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/212612865681?text=Bonjour, j'ai besoin d'aide concernant le site NLIVRILIK en maintenance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium contact-button"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                💬 WhatsApp Support
              </motion.a>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>📞 <strong>Téléphone direct :</strong> +212 612 865 681</p>
            </div>
          </div>

          {/* Statut et informations */}
          <div className="text-sm text-gray-500 space-y-2 border-t pt-4">
            <p>🔧 <strong>Statut :</strong> Maintenance programmée en cours</p>
            <p>⏱️ <strong>Durée estimée :</strong> Remise en service prochainement</p>
            <p>📊 <strong>Services affectés :</strong> Site web temporairement indisponible</p>         
          </div>

          {/* Message spécial pour les urgences */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium text-sm">
              🚨 <strong>Pour les urgences de livraison :</strong> Contactez directement yelmouss devt via WhatsApp ou email
            </p>
          </div>
        </motion.div>

     
      </motion.div>
    </div>
  );
}
