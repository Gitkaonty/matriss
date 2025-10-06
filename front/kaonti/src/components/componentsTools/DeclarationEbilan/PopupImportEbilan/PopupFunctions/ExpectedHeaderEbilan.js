const expectedBhiapcHeader = {
    nif: '',
    raison_sociale: '',
    adresse: '',
    montant_charge: '',
    montant_beneficiaire: ''
}

const expectedMpHeader = {
    marche: '',
    ref_marche: '',
    date: '',
    date_paiement: '',
    montant_marche_ht: '',
    montant_paye: '',
    tmp: ''
}

const expectedSeHeader = {
    liste_emprunteur: '',
    date_contrat: '',
    duree_contrat: '',
    montant_emprunt: '',
    montant_interet: '',
    montant_total: '',
    date_disposition: '',
    date_remboursement: '',
    montant_rembourse_capital: '',
    montant_rembourse_interet: '',
    solde_non_rembourse: ''
}

const expectedDaHeader = {
    rubriques_poste: '',
    libelle: '',
    num_compte: '',
    date_acquisition: '',
    taux: '',
    valeur_acquisition: '',
    augmentation: '',
    diminution: '',
    amort_anterieur: '',
    dotation_exercice: '',
}

const expectedEiafncHeader = {
    rubriques_poste: '',
    libelle: '',
    num_compte: '',
    valeur_acquisition: '',
    augmentation: '',
    diminution: '',
}

const expectedBhiapcHeadersKeys = Object.keys(expectedBhiapcHeader);
const expectedMpHeaderKeys = Object.keys(expectedMpHeader);
const expectedSeHeaderKeys = Object.keys(expectedSeHeader);
const expectedDaHeaderKeys = Object.keys(expectedDaHeader);
const expectedEiafncHeaderKeys = Object.keys(expectedEiafncHeader);

export default {
    expectedBhiapcHeadersKeys,
    expectedMpHeaderKeys,
    expectedSeHeaderKeys,
    expectedDaHeaderKeys,
    expectedEiafncHeaderKeys
}