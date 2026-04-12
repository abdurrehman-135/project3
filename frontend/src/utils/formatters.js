import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

const asDate = (value) => {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? parseISO(value) : new Date(value);
  return isValid(date) ? date : null;
};

export const formatDate = (value, pattern = "MMM d, yyyy") => {
  const date = asDate(value);
  return date ? format(date, pattern) : "No date";
};

export const formatRelative = (value) => {
  const date = asDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "Just now";
};

export const currency = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const classNames = (...values) => values.filter(Boolean).join(" ");

