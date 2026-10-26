// DRY: donor eligibility rules ek jayga e. Gap bodlate hole shudhu ei number.
export const DONATION_GAP_DAYS = 90;
export const LIVES_PER_DONATION = 3;
const DAY_MS = 864e5;

export function getEligibility(lastDonation, now = new Date()) {
  if (!lastDonation) return { isEligible: true, nextEligibleDate: null, daysUntilEligible: 0 };
  const next = new Date(new Date(lastDonation).getTime() + DONATION_GAP_DAYS * DAY_MS);
  const daysUntilEligible = Math.max(0, Math.ceil((next - now) / DAY_MS));
  return { isEligible: daysUntilEligible === 0, nextEligibleDate: next, daysUntilEligible };
}

export const livesImpacted = donations => donations * LIVES_PER_DONATION;
