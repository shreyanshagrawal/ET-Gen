import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

// Size map — pass size prop as px number or use the string presets
const SIZE_MAP = { sm: 24, default: 40, lg: 48 };

function resolveSize(size) {
  if (typeof size === "number") return size;
  return SIZE_MAP[size] ?? SIZE_MAP.default;
}

function Avatar({ className, size = "default", style, ...props }) {
  const px = resolveSize(size);
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={className}
      style={{
        position: "relative",
        display: "flex",
        width: px,
        height: px,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: "50%",
        userSelect: "none",
        ...style,
      }}
      {...props}
    />
  );
}

function AvatarImage({ style, ...props }) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      style={{
        aspectRatio: "1 / 1",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
      {...props}
    />
  );
}

function AvatarFallback({ style, ...props }) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
        color: "#fff",
        fontSize: "0.875rem",
        fontWeight: 700,
        ...style,
      }}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
