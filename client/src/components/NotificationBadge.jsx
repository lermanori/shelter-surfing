const NotificationBadge = ({ count, className = "" }) => {
  if (!count || count === 0) {
    return null;
  }

  return (
    <span className={`
      absolute -top-1 -right-1 
      inline-flex items-center justify-center 
      px-1.5 py-0.5 
      text-xs font-bold 
      text-white 
      bg-red-500 
      rounded-full 
      min-w-[18px] 
      h-[18px]
      ${className}
    `}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge; 