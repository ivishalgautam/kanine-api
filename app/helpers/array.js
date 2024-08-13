import moment from "moment";

export function mergeArrays(enquiries, orders) {
  const merged = {};

  enquiries.forEach((item) => {
    const date = moment(item.date).format("MMM YY");
    if (!merged[date]) {
      merged[date] = { date };
    }
    merged[date].Enquiries =
      parseInt(item.Enquiries) + (merged[date].Enquiries || 0);
  });

  orders.forEach((item) => {
    const date = moment(item.date).format("MMM YY");
    if (!merged[date]) {
      merged[date] = { date };
    }
    merged[date].Orders = parseInt(item.Orders) + (merged[date].Orders || 0);
  });

  return Object.values(merged);
}
