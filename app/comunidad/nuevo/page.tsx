import { permanentRedirect } from "next/navigation";

/** Topic creation was retired: everyone now replies in one of the two roots. */
export default function NuevoTemaPage() {
  permanentRedirect("/comunidad");
}
