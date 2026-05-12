export const formatDateRange = (startDateStr, endDateStr) => {
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : null;

  const options = { month: 'short', day: 'numeric' };
  const yearOptions = { month: 'short', day: 'numeric', year: 'numeric' };

  if (!end || startDateStr.split('T')[0] === endDateStr.split('T')[0]) {
    return start.toLocaleDateString('en-US', yearOptions);
  }

  // Multi-day logic
  const startPart = start.toLocaleDateString('en-US', options);
  const endPart = end.toLocaleDateString('en-US', yearOptions);

  return `${startPart} - ${endPart}`;
};

export const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
