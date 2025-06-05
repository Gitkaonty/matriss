import React, { createContext, useState, useContext } from 'react';

// Créer le contexte
const FileInfosContext = createContext();

// Fournisseur de contexte
export function FileInfosProvider({ children }) {
  const [idDossier, setIdDossier] = useState(0); // État dans le parent
  const [nomDossier, setNomDossier] = useState('');

  // Fournir à l'enfant à la fois l'id et la fonction de mise à jour
  return (
    <FileInfosContext.Provider value={{ idDossier, setIdDossier, nomDossier, setNomDossier }}>
      {children}
    </FileInfosContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte dans n'importe quel composant
export default FileInfosContext;
// export function useFileInfos() {
//   return useContext(FileInfosContext);
// }