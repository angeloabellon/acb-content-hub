import { signOutCommunity } from "@/app/comunidad/actions";
import type { CommunityViewer } from "@/lib/community";

type CommunitySessionStatusProps = {
  viewer: CommunityViewer;
};

export default function CommunitySessionStatus({
  viewer,
}: CommunitySessionStatusProps) {
  const identity = viewer.email ?? "miembro de la Comunidad";

  return (
    <div className="border-b border-white/10 bg-black/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/70">
          Sesión iniciada como <span className="font-semibold text-white">{identity}</span>
        </p>
        <form action={signOutCommunity}>
          <button
            type="submit"
            className="text-left text-sm font-semibold text-white/70 transition-colors hover:text-orange-300 sm:text-right"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
