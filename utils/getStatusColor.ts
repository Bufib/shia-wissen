const getStatusColor = (status: string) => {
  switch (status) {
    case "Beantwortet":
      return "#4CAF50"; // Green
    case "Beantwortung steht noch aus":
      return "#FFA500"; // Orange
    case "Abgelehnt":
      return "#F44336"; // Red
    default:
      return "#999999"; // Gray
  }
};

export default getStatusColor;
