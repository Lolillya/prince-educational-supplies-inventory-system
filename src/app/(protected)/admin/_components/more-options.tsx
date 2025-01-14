import { Ellipsis } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";

interface moreOptionsProps {
  className?: string;
}

const MoreOptions: React.FC<moreOptionsProps> = ({ className }) => {
  return (
    <Button asChild>
      <div className={`${className} flex h-12 w-12 items-center justify-center rounded-xl bg-transparent transition-colors duration-300 hover:bg-slate-200`}>
        <Ellipsis
          className="!h-5 !w-5 text-slate-500 hover:text-slate-600"
          strokeWidth={2.5}
        />
      </div>
    </Button>
  );
};

export default MoreOptions;
