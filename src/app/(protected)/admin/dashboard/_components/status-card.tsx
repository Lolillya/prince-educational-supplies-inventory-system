import {
  Archive,
  ChevronsDown,
  ChevronsRight,
  ChevronsUp,
  NotebookText,
  Truck,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

type StatusProps = {
  percentage?: number;
  count: number | undefined;
};

export const StockInStatus: React.FC<StatusProps> = ({
  percentage = 0,
  count,
}) => {
  const router = useRouter();

  return (
    <div
      className="w-1/4 rounded-lg bg-slate-100 p-6 transition-colors duration-300 hover:cursor-pointer hover:bg-slate-200/80"
      onClick={() => router.push("/admin/restock")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <p className="text-slate-500">Stocked In</p>
            {percentage > 0 ? (
              <div className="flex items-center text-green">
                <ChevronsUp className="h-4 w-4" />
                <p className="tracking-wide">
                  <span>{percentage.toFixed(1)}</span>%
                </p>
              </div>
            ) : percentage < 0 ? (
              <div className="flex items-center text-red">
                <ChevronsDown className="h-4 w-4" />
                <p className="tracking-wide">
                  <span>{(percentage * -1).toFixed(1)}</span>%
                </p>
              </div>
            ) : (
              <div className="flex items-center text-amber-500">
                <ChevronsRight className="h-4 w-4" />
                <p className="tracking-wide">
                  <span>{percentage.toFixed(1)}</span>%
                </p>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-700">
            {count?.toLocaleString()}
          </p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-200">
          <Archive className="h-10 w-10 text-sky-500" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export const StockOutStatus: React.FC<StatusProps> = ({
  percentage = 0,
  count,
}) => {
  const router = useRouter();

  return (
    <div
      className="w-1/4 rounded-lg bg-slate-100 p-6 transition-colors duration-300 hover:cursor-pointer hover:bg-slate-200/80"
      onClick={() => router.push("/admin/invoice")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <p className="text-slate-500">Stocked Out</p>
            {percentage > 0 ? (
              <div className="flex items-center text-green">
                <ChevronsUp className="h-4 w-4" />
                <p className="tracking-wide">
                  <span>{percentage.toFixed(1)}</span>%
                </p>
              </div>
            ) : percentage < 0 ? (
              <div className="flex items-center text-red">
                <ChevronsDown className="h-4 w-4" />
                <p className="tracking-wide">
                  <span>{(percentage * -1).toFixed(1)}</span>%
                </p>
              </div>
            ) : (
              <div className="flex items-center text-amber-500">
                <ChevronsRight className="h-4 w-4" />
                <p className="tracking-wide">
                  <span>{percentage.toFixed(1)}</span>%
                </p>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-700">
            {count?.toLocaleString()}
          </p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-200">
          <NotebookText className="h-10 w-10 text-sky-500" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export const CustomerStatus: React.FC<StatusProps> = ({ count }) => {
  const router = useRouter();

  return (
    <div
      className="w-1/4 rounded-lg bg-slate-100 p-6 transition-colors duration-300 hover:cursor-pointer hover:bg-slate-200/80"
      onClick={() => router.push("/admin/customers")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3">
          <p className="text-slate-500">Customers</p>
          <p className="text-2xl font-bold text-slate-700">
            {count?.toLocaleString()}
          </p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-200">
          <UsersRound className="h-10 w-10 text-pink-500" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export const SupplierStatus: React.FC<StatusProps> = ({ count }) => {
  const router = useRouter();

  return (
    <div
      className="w-1/4 rounded-lg bg-slate-100 p-6 transition-colors duration-300 hover:cursor-pointer hover:bg-slate-200/80"
      onClick={() => router.push("/admin/suppliers")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3">
          <p className="text-slate-500">Suppliers</p>
          <p className="text-2xl font-bold text-slate-700">
            {count?.toLocaleString()}
          </p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-200">
          <Truck className="h-10 w-10 text-pink-500" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};
