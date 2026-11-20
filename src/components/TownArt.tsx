import { useState } from "react";
import { DEFAULT_TOWN_ART } from "@/data/townArt";

interface TownArtProps {
  src?: string | null;
  className?: string;
}

const TownArt = ({ src, className }: TownArtProps) => {
  const requestedSrc = src || DEFAULT_TOWN_ART;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return (
    <img
      src={failedSrc === requestedSrc ? DEFAULT_TOWN_ART : requestedSrc}
      onError={() => setFailedSrc(requestedSrc)}
      alt=""
      className={className}
    />
  );
};

export default TownArt;