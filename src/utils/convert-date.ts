export function convertDate(date: string) {
  const [day, month, year] = date.split("/");
  const formattedDate = new Date(`${year}-${month}-${day}`);
  return formattedDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
