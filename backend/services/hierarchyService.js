const validator = require('../utils/validator');

/**
 * Processes the input edges to build trees, detect cycles, and gather stats.
 */
exports.processEdges = (rawEdges) => {
    const invalid_entries = [];
    const duplicate_edges = [];
    const valid_edges = [];
    const seen_edges = new Set();
    const child_parents = new Map(); // child -> parent (to handle multiple parents)

    // 1 & 2. Validation and Duplicate Handling
    rawEdges.forEach(raw => {
        const trimmed = raw.trim();
        const validation = validator.validateEdge(trimmed);

        if (!validation.isValid) {
            invalid_entries.push(trimmed);
            return;
        }

        const { parent, child } = validation;
        const edgeStr = `${parent}->${child}`;

        if (seen_edges.has(edgeStr)) {
            if (!duplicate_edges.includes(edgeStr)) {
                duplicate_edges.push(edgeStr);
            }
            return;
        }

        // Multiple parent rule: first occurrence wins
        if (child_parents.has(child)) {
            // Silently ignore other parents for this child in terms of tree construction
            return;
        }

        seen_edges.add(edgeStr);
        child_parents.set(child, parent);
        valid_edges.push({ parent, child });
    });

    // Build Adjacency List
    const adj = {};
    const nodes = new Set();
    const children = new Set();

    valid_edges.forEach(({ parent, child }) => {
        if (!adj[parent]) adj[parent] = [];
        adj[parent].push(child);
        nodes.add(parent);
        nodes.add(child);
        children.add(child);
    });

    // Root Identification: node that never appears as child
    const roots = Array.from(nodes).filter(node => !children.has(node)).sort();

    // If no root exists (cycle only), pick lexicographically smallest node from whole set
    if (roots.length === 0 && nodes.size > 0) {
        roots.push(Array.from(nodes).sort()[0]);
    }

    const hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let maxDepthOverall = -1;
    let largest_tree_root = "";

    const visitedNodes = new Set();

    roots.forEach(root => {
        if (visitedNodes.has(root)) return;
        
        const cycleResult = detectCycle(root, adj, new Set());
        
        if (cycleResult.has_cycle) {
            total_cycles++;
            hierarchies.push({
                root: root,
                tree: {},
                has_cycle: true
            });
            // Mark all reachable nodes in this cycle component as visited
            markVisited(root, adj, visitedNodes);
        } else {
            total_trees++;
            const { tree, depth } = buildTree(root, adj);
            hierarchies.push({
                root: root,
                tree: tree,
                has_cycle: false,
                depth: depth
            });

            if (depth > maxDepthOverall) {
                maxDepthOverall = depth;
                largest_tree_root = root;
            } else if (depth === maxDepthOverall) {
                if (root < largest_tree_root) {
                    largest_tree_root = root;
                }
            }
            markVisited(root, adj, visitedNodes);
        }
    });

    // Handle remaining components (cycles with no detectable root)
    const remainingNodes = Array.from(nodes).filter(n => !visitedNodes.has(n)).sort();
    while (remainingNodes.length > 0) {
        const nextStart = remainingNodes[0];
        total_cycles++;
        hierarchies.push({
            root: nextStart,
            tree: {},
            has_cycle: true
        });
        markVisited(nextStart, adj, visitedNodes);
        
        // Refresh remaining nodes
        const currentRemaining = remainingNodes.filter(n => !visitedNodes.has(n));
        remainingNodes.length = 0;
        remainingNodes.push(...currentRemaining);
    }

    return {
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root: largest_tree_root || null
        }
    };
};

function detectCycle(node, adj, visited, stack = new Set()) {
    visited.add(node);
    stack.add(node);

    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
            if (detectCycle(neighbor, adj, visited, stack).has_cycle) return { has_cycle: true };
        } else if (stack.has(neighbor)) {
            return { has_cycle: true };
        }
    }

    stack.delete(node);
    return { has_cycle: false };
}

function markVisited(node, adj, visited) {
    if (visited.has(node)) return;
    visited.add(node);
    const neighbors = adj[node] || [];
    neighbors.forEach(n => markVisited(n, adj, visited));
}

function buildTree(node, adj) {
    const children = adj[node] || [];
    const tree = {};
    let maxChildDepth = 0;

    children.forEach(child => {
        const { tree: childTree, depth: childDepth } = buildTree(child, adj);
        tree[child] = childTree;
        maxChildDepth = Math.max(maxChildDepth, childDepth);
    });

    return { tree, depth: maxChildDepth + 1 };
}
