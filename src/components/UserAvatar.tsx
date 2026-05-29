"use client";

import Image from "next/image";

interface UserAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

const SIZE_PX = {
  sm: 28,
  md: 36,
  lg: 48,
};

export default function UserAvatar({ name, photoUrl, size = "md" }: UserAvatarProps) {
  const initial = name?.[0]?.toUpperCase() || "?";

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={SIZE_PX[size]}
        height={SIZE_PX[size]}
        unoptimized
        className={`${SIZE_CLASSES[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full bg-accent flex items-center justify-center text-bg-page font-semibold shrink-0`}
    >
      {initial}
    </div>
  );
}
