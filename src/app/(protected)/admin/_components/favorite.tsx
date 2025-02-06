import { Star } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";

interface FavoriteProps {
  className?: string;
}

const Favorite: React.FC<FavoriteProps> = ({ className }) => {
  return (
    <Button
      variant="ghost"
      className={`group flex h-12 w-12 items-center justify-center rounded-xl bg-transparent hover:bg-amber-200/60 transition-all duration-300 ${className}`}
    >
      <Star className="!h-5 !w-5 text-slate-500 group-hover:text-amber-500 transition-colors duration-300" strokeWidth={2.5} />
    </Button>
  );
};

export default Favorite;
