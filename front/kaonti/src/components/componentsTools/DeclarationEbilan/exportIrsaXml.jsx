export const exportIrsaToXml = (irsaData, mois, annee, nif = null) => {
  try {
    // Validation du NIF (ncc)
    if (!nif || nif.trim() === '') {
      return {
        success: false,
        error: 'Veuillez renseigner le NIF dans les informations du dossier avant d\'exporter.'
      };
    }
    // Fonction utilitaire pour formater les dates
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    };

    // Fonction utilitaire pour formater les valeurs numériques
    const formatValue = (value) => {
      if (value === null || value === undefined || value === '') return '';
      if (typeof value === 'number') return value.toString();
      return value.toString();
    };

    // Fonction utilitaire pour créer un champ XML
    const createChamp = (code, valeur) => {
      return `<champ>\n<code>${code}</code>\n<valeur>${formatValue(valeur)}</valeur>\n</champ>`;
    };

    // Construction du XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n    <EDI>\n    <informations>\n    <type>IRSA</type>\n    <ncc>${nif.trim()}</ncc>\n    <codeTaxe>IRSA</codeTaxe>\n    <mois>${mois}</mois>\n    <exercice>${annee}</exercice>\n    </informations>\n    <tableaux>\n    <tableau>\n    <donnees>`;

    // Génération des lignes pour chaque employé
    irsaData.forEach(row => {
      xml += `\n<ligne>`;

      // Mapping des champs selon le format EDI requis
      const champs = [
        { code: 'MATRICULE', valeur: row.personnel?.id || row.personnel_id || '' },
        { code: 'NUMERO_CNAPS', valeur: row.personnel?.numero_cnaps || '' },
        { code: 'NOM_PRENOM', valeur: `${row.personnel?.nom || ''} ${row.personnel?.prenom || ''}`.trim() },
        { code: 'NUMERO_CIN', valeur: row.personnel?.cin_ou_carte_resident || '' },
        { code: 'DATE_ENTREE', valeur: formatDate(row.personnel?.date_entree) },
        { code: 'DATE_SORTIE', valeur: formatDate(row.personnel?.date_sortie) },
        { code: 'FONCTION', valeur: row.personnel?.fonction?.nom || row.personnel?.fonction || '' },
        { code: 'SALAIRE_BASE', valeur: row.salaireBase || 0 },
        { code: 'INDEMNITE_IMPOSABLE', valeur: row.indemniteImposable || 0 },
        { code: 'INDEMNITE_NONIMPOSABLE', valeur: row.indemniteNonImposable || 0 },
        { code: 'AVANTAGE_IMPOSABLE', valeur: row.avantageImposable || 0 },
        { code: 'AVANTAGE_EXONERE', valeur: row.avantageExonere || 0 },
        { code: 'HEURES_SUP', valeur: row.heuresSupp || '' },
        { code: 'MONTANT_PRIMES', valeur: row.primeGratification || 0 },
        { code: 'MONTANT_AUTRES', valeur: row.autres || 0 },
        { code: 'SALAIRE_BRUT', valeur: row.salaireBrut || 0 },
        { code: 'DEDUCTION_CNAPS', valeur: row.cnapsRetenu || 0 },
        { code: 'DEDUCTION_OSTIES', valeur: row.ostie || 0 },
        { code: 'DEDUCTION_SALAIRE_NET', valeur: row.salaireNet || 0 },
        { code: 'DEDUCTION_AUTRE', valeur: row.autreDeduction || 0 },
        { code: 'MONTANT_IMPOSABLE', valeur: row.montantImposable || 0 },
        { code: 'MONTANT_IMPOT', valeur: row.impotCorrespondant || 0 },
        { code: 'REDUCTION', valeur: row.reductionChargeFamille || 0 },
        { code: 'IMPOT_NET', valeur: row.impotDu || 0 }
      ];

      // Ajout de chaque champ
      champs.forEach(champ => {
        xml += `\n${createChamp(champ.code, champ.valeur)}`;
      });

      xml += `\n</ligne>`;
    });

    xml += `\n</donnees>\n</tableau>\n</tableaux>\n</EDI>`;

    // Création du fichier et téléchargement
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    const fileName = `IRSA_EDI_${monthNames[mois - 1]}_${annee}_${new Date().toISOString().split('T')[0]}.xml`;
    
    // Création du blob et téléchargement
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, fileName };

  } catch (error) {
    console.error('Erreur lors de l\'export XML IRSA:', error);
    return { success: false, error: error.message };
  }
};
