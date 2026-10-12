import { permanentRedirect } from "next/navigation";

/** Topic creation was retired: everyone now replies in one permanent conversation. */
export default function NuevoTemaPage() {
  permanentRedirect("/comunidad");
}
