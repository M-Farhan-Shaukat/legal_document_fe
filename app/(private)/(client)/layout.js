import { PublicHeader } from "@/app/shared";

export default function Privatelayout({ children }) {
  return (
    <div>
      <PublicHeader isClient />
      {children}
    </div>
  );
}
