
export interface ClaimResponse {
  success: boolean;
  message: string;
  remainingInventory?: number;
}

export class ClaimError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ClaimError";
    this.status = status;
  }
}

export async function claimAirdrop(): Promise<ClaimResponse> {
  // Simulate network latency.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Simulate server response.
  const isConflict = Math.random() < 0.35;

  if (isConflict) {
    throw new ClaimError(
      "Airdrop crate is no longer available.",
      409
    );
  }

  return {
    success: true,
    message: "Airdrop claimed successfully!",
  };
}
