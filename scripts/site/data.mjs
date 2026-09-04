export const variants = [
  { file: "forro-roots-color-theme.json", label: "Roots", id: "roots" },
  { file: "forro-intimo-color-theme.json", label: "Íntimo", id: "intimo" },
  {
    file: "forro-nordeste-vivo-color-theme.json",
    label: "Nordeste Vivo",
    id: "nordeste",
  },
  {
    file: "forro-pe-de-serra-color-theme.json",
    label: "Pé de Serra",
    id: "pe-de-serra",
  },
  { file: "forro-pd-color-theme.json", label: "PD", id: "pd" },
];

export const lightVariants = [
  { file: "forro-roots-light-color-theme.json", label: "Roots", id: "roots" },
  {
    file: "forro-intimo-light-color-theme.json",
    label: "Íntimo",
    id: "intimo",
  },
  {
    file: "forro-nordeste-vivo-light-color-theme.json",
    label: "Nordeste Vivo",
    id: "nordeste",
  },
  {
    file: "forro-pe-de-serra-light-color-theme.json",
    label: "Pé de Serra",
    id: "pe-de-serra",
  },
  { file: "forro-pd-light-color-theme.json", label: "PD", id: "pd" },
];

export const languages = [
  { id: "python", label: "Python", lang: "python" },
  { id: "javascript", label: "JavaScript", lang: "javascript" },
  { id: "cpp", label: "C++", lang: "cpp" },
];

export function variantDescription(id) {
  const map = {
    roots: "Grounded terracotta and forest tones for a shared, steady pulse",
    intimo:
      "Softer, quieter hues for late sets, study sessions and after-hours flow",
    nordeste: "Bright accents tuned to radios, festas and busy dance floors",
    "pe-de-serra":
      "Wood, leather and percussion warmth for close-room movement",
    pd: "Cool greens and blues for contemporary stages and city nights",
  };
  return map[id] ?? "";
}
