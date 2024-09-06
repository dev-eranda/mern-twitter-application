export const formatPostDate = (createdAt) => {
  const createdAtDate = new Date(createdAt);
  const currentDate = new Date();

  // Check if the date is valid
  if (isNaN(createdAtDate)) return "Invalid date";

  const diffInSeconds = Math.floor((currentDate - createdAtDate) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 1) {
    // Return a formatted date for posts older than a day
    return createdAtDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  if (diffInDays === 1) return "1d ago";
  if (diffInHours >= 1) return `${diffInHours}h ago`;
  if (diffInMinutes >= 1) return `${diffInMinutes}m ago`;
  if (diffInSeconds >= 1) return `${diffInSeconds}s ago`;

  return "Just now";
};

export const formatMemberSinceDate = (createdAt) => {
  const date = new Date(createdAt);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `Joined ${month} ${year}`;
};
