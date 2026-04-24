/**
 * Validates the edge format X->Y
 * Rules:
 * - Single uppercase letters A-Z for both X and Y
 * - No empty strings
 * - No self-loops (A->A)
 * - Must strictly follow X->Y format
 */
exports.validateEdge = (edge) => {
    if (!edge || typeof edge !== 'string') {
        return { isValid: false };
    }

    const parts = edge.split('->');

    if (parts.length !== 2) {
        return { isValid: false };
    }

    const parent = parts[0].trim();
    const child = parts[1].trim();

    // Check if empty
    if (!parent || !child) {
        return { isValid: false };
    }

    // Single uppercase letter check
    const isSingleUpper = (str) => /^[A-Z]$/.test(str);

    if (!isSingleUpper(parent) || !isSingleUpper(child)) {
        return { isValid: false };
    }

    // Self-loop check
    if (parent === child) {
        return { isValid: false };
    }

    return {
        isValid: true,
        parent,
        child
    };
};
