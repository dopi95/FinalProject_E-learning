// Utility function to check if a user is online
export const isUserOnline = (user) => {
  if (!user || !user.lastSeen) return false;
  
  const now = new Date();
  const lastSeen = new Date(user.lastSeen);
  const timeDifference = now - lastSeen;
  
  // Consider user online if they were active within the last 5 minutes
  const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  return user.isOnline && timeDifference < ONLINE_THRESHOLD;
};

// Get online status display text
export const getOnlineStatusText = (user) => {
  if (isUserOnline(user)) {
    return 'online';
  }
  return null; // Return null to show nothing when offline
};

// Get online status indicator component
export const OnlineStatusIndicator = ({ user, showText = true }) => {
  const online = isUserOnline(user);
  
  if (!online && !showText) return null;
  
  return (
    <div className="flex items-center gap-1">
      {online && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      )}
      {showText && online && (
        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
          online
        </span>
      )}
    </div>
  );
};