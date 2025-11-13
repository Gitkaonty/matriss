const formatDateToISO = (dateStr) => {
    if (!dateStr) return null;

    const str = String(dateStr).trim();
    const parts = str.includes('/') ? str.split('/') : str.split('-');

    if (parts.length !== 3) return null;

    let day, month, year;

    if (str.includes('/')) {
        const [a, b, c] = parts.map(Number);

        if (a > 12) {
            day = a;
            month = b;
            year = c;
        } else if (b > 12) {
            day = b;
            month = a;
            year = c;
        } else {
            day = a;
            month = b;
            year = c;
        }
    } else {
        [year, month, day] = parts.map(Number);
    }

    if (
        isNaN(day) || isNaN(month) || isNaN(year) ||
        day < 1 || day > 31 ||
        month < 1 || month > 12 ||
        year < 1000 || year > 9999
    ) {
        console.warn(`Date invalide : ${str}`);
        return null;
    }

    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export default formatDateToISO;