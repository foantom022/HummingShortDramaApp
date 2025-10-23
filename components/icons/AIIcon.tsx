import Image from 'next/image';

interface AIIconProps {
  className?: string;
  isActive?: boolean;
}

export default function AIIcon({ className = '', isActive = false }: AIIconProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src="/ai-icon.png"
        alt="AI"
        fill
        className={`object-contain ${isActive ? 'opacity-100' : 'opacity-80'}`}
        priority
      />
    </div>
  );
}
