export const popupTitles = {
    "4": "BILAN",
    "5": "CRN",
    "6": "CRF",
    "7": "TFTD",
    "8": "TFTI",
    "9": "EVCP",
    "10": "DRF",
    "11": "BHIAPC",
    "12": "MP",
    "13": "DA",
    "14": "DP",
    "15": "EIAFNC",
    "16": "SAD",
    "17": "SDR",
    "18": "SE",
    "19": "NE"
};

export const fileUrls = {
    "11": '../../../../../public/modeleImport/ebilan/modeleImportBhiapc.csv',
    "12": '../../../../../public/modeleImport/ebilan/modeleImportMp.csv',
    "13": '../../../../../public/modeleImport/ebilan/modeleImportDa.csv',
    "15": '../../../../../public/modeleImport/ebilan/modeleImportEiafnc.csv',
    "18": '../../../../../public/modeleImport/ebilan/modeleImportSe.csv',
};

export const getPopupTitle = (value) => popupTitles[value] || '';
export const getFileUrl = (value) => fileUrls[value] || '';
