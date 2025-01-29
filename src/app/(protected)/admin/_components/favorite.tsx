import { Star } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";

interface favoriteProps {
  className?: string;
}

const Favorite: React.FC<favoriteProps> = ({ className }) => {
  return (
    <Button asChild>
      <div className={`${className} flex h-12 w-12 items-center justify-center rounded-xl bg-transparent transition-colors duration-300 hover:bg-slate-200`}>
        <Star
          className="!h-5 !w-5 text-slate-500 hover:text-slate-600"
          strokeWidth={2.5}
        />
      </div>
    </Button>
  );
};

export default Favorite;
