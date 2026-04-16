export function getAgeGroup(age: number) {
  if (age <= 12) return "child";
  if (age <= 19) return "teenager";
  if (age <= 59) return "adult";
  return "senior";
}

export function getTopCountry(countries: any[]) {
  return countries.sort((a, b) => b.probability - a.probability)[0];
}
