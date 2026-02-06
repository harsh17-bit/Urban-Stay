const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[var(--primary-color)] rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-4 border-gray-100 border-t-[var(--secondary-color)] rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
      </div>
    </div>
  );
};

export default Loader;