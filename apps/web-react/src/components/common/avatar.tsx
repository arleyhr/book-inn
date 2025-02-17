interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

export function Avatar({ src, alt, size = 32 }: AvatarProps) {
  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  const getRandomColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-green-500'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`${getRandomColor(alt)} rounded-full flex items-center justify-center text-white font-medium`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitial(alt)}
    </div>
  );
}
