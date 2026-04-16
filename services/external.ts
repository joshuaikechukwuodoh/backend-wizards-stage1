export async function fetchExternal(name: string) {
  const [genderRes, ageRes, nationRes] = await Promise.all([
    fetch(`https://api.genderize.io?name=${name}`),
    fetch(`https://api.agify.io?name=${name}`),
    fetch(`https://api.nationalize.io?name=${name}`)
  ]);

  const gender = await genderRes.json();
  const age = await ageRes.json();
  const nation = await nationRes.json();

  if (!gender.gender || gender.count === 0) {
    throw new Error("Genderize returned an invalid response");
  }

  if (age.age === null) {
    throw new Error("Agify returned an invalid response");
  }

  if (!nation.country?.length) {
    throw new Error("Nationalize returned an invalid response");
  }

  return { gender, age, nation };
}