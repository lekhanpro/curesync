import * as Network from 'expo-network';

interface InteractionResult {
    status: 'safe' | 'warning' | 'unknown';
    message: string;
    severity?: 'low' | 'moderate' | 'high';
    drugA?: string;
    drugB?: string;
}

const FDA_BASE = 'https://api.fda.gov/drug/label.json';

/**
 * Check for drug interactions between a new drug and existing medications.
 * Queries the openFDA Drug Label API and parses warnings/interactions sections.
 * Returns 'unknown' when offline — never blocks the user from adding meds.
 */
export async function checkDrugInteraction(
    newDrug: string,
    existingDrugs: string[]
): Promise<InteractionResult[]> {
    // ── Network check ──────────────────────────────────────
    try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected || !networkState.isInternetReachable) {
            return [{
                status: 'unknown',
                message: 'Interaction check unavailable — you are offline. The medication has been saved, but please verify interactions when you reconnect.',
            }];
        }
    } catch {
        // If we can't even check network, treat as offline
        return [{
            status: 'unknown',
            message: 'Could not determine network status. Interaction check skipped.',
        }];
    }

    if (existingDrugs.length === 0) {
        return [{ status: 'safe', message: 'No existing medications to check against.' }];
    }

    const results: InteractionResult[] = [];

    try {
        // ── Query FDA for the new drug's label ───────────────
        const encodedDrug = encodeURIComponent(newDrug.trim());
        const url = `${FDA_BASE}?search=openfda.brand_name:"${encodedDrug}"+openfda.generic_name:"${encodedDrug}"&limit=1`;
        const response = await fetch(url);

        if (!response.ok) {
            return [{
                status: 'unknown',
                message: `FDA API returned status ${response.status}. Interaction check skipped.`,
            }];
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return [{
                status: 'unknown',
                message: `No FDA data found for "${newDrug}". Please consult your pharmacist.`,
            }];
        }

        const label = data.results[0];
        const interactionText = [
            ...(label.drug_interactions || []),
            ...(label.warnings || []),
            ...(label.warnings_and_cautions || []),
        ].join(' ').toLowerCase();

        // ── Check each existing drug against the warnings ────
        for (const drug of existingDrugs) {
            const drugLower = drug.toLowerCase().trim();
            const variants = [drugLower, drugLower.replace(/\s+/g, '')];

            const found = variants.some((v) =>
                new RegExp(`\\b${escapeRegex(v)}\\b`, 'i').test(interactionText)
            );

            if (found) {
                // Try to extract context around the mention
                const contextMatch = interactionText.match(
                    new RegExp(`.{0,80}${escapeRegex(drugLower)}.{0,80}`, 'i')
                );

                results.push({
                    status: 'warning',
                    message: contextMatch
                        ? `Potential Interaction Detected: ${newDrug} and ${drug} — "${contextMatch[0].trim()}..."`
                        : `Potential Interaction Detected: ${newDrug} and ${drug} may interact. Consult your healthcare provider.`,
                    severity: 'moderate',
                    drugA: newDrug,
                    drugB: drug,
                });
            }
        }

        if (results.length === 0) {
            results.push({
                status: 'safe',
                message: `No known interactions found between ${newDrug} and your current medications.`,
            });
        }
    } catch (err) {
        console.warn('FDA interaction check error:', err);
        results.push({
            status: 'unknown',
            message: 'Interaction check failed. Please consult your pharmacist.',
        });
    }

    return results;
}

/** Escape special regex characters */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
