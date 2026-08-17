const monthMap: Record<string, string[]> = {
  "January": ["january", "ජනවාරි", "jan", "1", "01"],
  "February": ["february", "පෙබරවාරි", "feb", "2", "02"],
  "March": ["march", "මාර්තු", "mar", "3", "03"],
  "April": ["april", "අප්‍රේල්", "apr", "4", "04"],
  "May": ["may", "මැයි", "5", "05"],
  "June": ["june", "ජූනි", "jun", "6", "06"],
  "July": ["july", "ජූලි", "jul", "7", "07"],
  "August": ["august", "අගෝස්තු", "aug", "8", "08"],
  "September": ["september", "සැප්තැම්බර්", "sep", "9", "09"],
  "October": ["october", "ඔක්තෝබර්", "oct", "10"],
  "November": ["november", "නොවැම්බර්", "nov", "11"],
  "December": ["december", "දෙසැම්බර්", "dec", "12"]
};

export const isSameMonth = (danaMonthRaw: string, targetMonth: string): boolean => {
  if (!danaMonthRaw || !targetMonth || targetMonth === "ALL" || targetMonth === "All Months") return true;
  const dMonth = danaMonthRaw.trim().toLowerCase();
  const tMonth = targetMonth.trim().toLowerCase();
  if (dMonth === tMonth) return true;

  for (const [key, equivalents] of Object.entries(monthMap)) {
    const allNames = [key.toLowerCase(), ...equivalents];
    if (allNames.includes(tMonth) && allNames.includes(dMonth)) {
      return true;
    }
  }
  return false;
};
