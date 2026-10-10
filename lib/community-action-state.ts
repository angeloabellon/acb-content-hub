export type CommunityActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialCommunityActionState: CommunityActionState = { status: "idle" };
