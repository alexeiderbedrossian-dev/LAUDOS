import { cn } from "@/lib/utils";

export function ClinicLogo({
  className,
  alt = "Centro Médico Mercês",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/logo-merces.png"
      alt={alt}
      width={840}
      height={293}
      className={cn("h-auto w-auto max-w-full object-contain object-left", className)}
      decoding="async"
    />
  );
}
