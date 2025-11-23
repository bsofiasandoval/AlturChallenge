export const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatDurationLong = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} min ${seconds} sec`;
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatTag = (tag: string): string => {
  return tag.replace(/_/g, " ");
};

export const getSatisfactionColor = (score: number): string => {
  if (score >= 4) return "text-green-600";
  if (score >= 3) return "text-yellow-600";
  return "text-red-600";
};

export const getSatisfactionColorDetailed = (score: number): string => {
  if (score >= 4) return "text-green-600 bg-green-50 border-green-300";
  if (score >= 3) return "text-yellow-600 bg-yellow-50 border-yellow-300";
  return "text-red-600 bg-red-50 border-red-300";
};

const TAG_COLORS: Record<string, string> = {
  interested_buyer: "bg-green-100 text-green-700",
  ready_to_purchase: "bg-green-200 text-green-800",
  positive_feedback: "bg-green-100 text-green-700",
  needs_follow_up: "bg-blue-100 text-blue-700",
  callback_requested: "bg-blue-100 text-blue-700",
  scheduling: "bg-blue-100 text-blue-700",
  requesting_info: "bg-purple-100 text-purple-700",
  pricing_inquiry: "bg-purple-100 text-purple-700",
  complaint: "bg-red-100 text-red-700",
  not_interested: "bg-red-100 text-red-700",
  escalation_needed: "bg-red-200 text-red-800",
  wrong_number: "bg-gray-100 text-gray-700",
  voicemail: "bg-gray-100 text-gray-700",
  support_issue: "bg-yellow-100 text-yellow-700",
  decision_maker_absent: "bg-yellow-100 text-yellow-700",
};

export const getTagColor = (tag: string): string => {
  return TAG_COLORS[tag] || "bg-gray-100 text-gray-700";
};

const TAG_COLORS_DETAILED: Record<string, string> = {
  interested_buyer: "bg-green-100 text-green-700 border-green-300",
  ready_to_purchase: "bg-green-200 text-green-800 border-green-400",
  positive_feedback: "bg-green-100 text-green-700 border-green-300",
  needs_follow_up: "bg-blue-100 text-blue-700 border-blue-300",
  callback_requested: "bg-blue-100 text-blue-700 border-blue-300",
  scheduling: "bg-blue-100 text-blue-700 border-blue-300",
  requesting_info: "bg-purple-100 text-purple-700 border-purple-300",
  pricing_inquiry: "bg-purple-100 text-purple-700 border-purple-300",
  complaint: "bg-red-100 text-red-700 border-red-300",
  not_interested: "bg-red-100 text-red-700 border-red-300",
  escalation_needed: "bg-red-200 text-red-800 border-red-400",
  wrong_number: "bg-gray-100 text-gray-700 border-gray-300",
  voicemail: "bg-gray-100 text-gray-700 border-gray-300",
  support_issue: "bg-yellow-100 text-yellow-700 border-yellow-300",
  decision_maker_absent: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

export const getTagColorDetailed = (tag: string): string => {
  return TAG_COLORS_DETAILED[tag] || "bg-gray-100 text-gray-700 border-gray-300";
};
