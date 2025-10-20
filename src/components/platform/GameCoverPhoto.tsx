interface GameCoverPhotoProps {
  coverPhotoUrl?: string | null;
  logoUrl?: string | null;
  brandName?: string;
  className?: string;
}

export const GameCoverPhoto = ({
  coverPhotoUrl,
  logoUrl,
  brandName,
  className = ""
}: GameCoverPhotoProps) => {
  // If cover photo exists, show it
  if (coverPhotoUrl) {
    return (
      <div 
        className={`relative w-full bg-cover bg-center ${className}`}
        style={{ 
          backgroundImage: `url(${coverPhotoUrl})`,
          aspectRatio: '16/9'
        }}
      />
    );
  }

  // Fallback: Black background with logo or brand name
  return (
    <div 
      className={`relative w-full bg-black flex items-center justify-center ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Brand Logo"
          className="max-w-[200px] max-h-[120px] object-contain"
        />
      ) : brandName ? (
        <h2 className="text-white text-3xl font-bold text-center px-4">
          {brandName}
        </h2>
      ) : (
        <div className="text-gray-600 text-lg">No cover photo</div>
      )}
    </div>
  );
};