import { Compass } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ee] p-6 text-center text-[#15342b]">
      <div className="max-w-md rounded-[2rem] border border-[#15342b]/10 bg-white p-10 shadow-[0_24px_60px_-36px_rgba(21,52,43,0.5)]">
        <Compass className="mx-auto h-10 w-10 text-[#b9602c]" />
        <h1 className="mt-5 font-serif text-4xl">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">This page is not part of the cultural atlas.</p>
        <button type="button" onClick={() => setLocation("/")} className="mt-6 rounded-full bg-[#15342b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#204a3d]">Return to the atlas</button>
      </div>
    </main>
  );
}
