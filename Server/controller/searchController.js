import { search } from "../services/searchService.js";

/**
 * Handle search requests
 * GET /api/search?q=<query>&userId=<optional>
 */
export async function handleSearch(req, res) {
    try {
        const { q: query, userId } = req.query;

        if (!query) {
            return res.status(400).json({
                error: "Query parameter 'q' is required"
            });
        }

        const results = await search(query, userId);

        res.json({
            success: true,
            query,
            results,
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            error: "Failed to perform search",
            message: error.message
        });
    }
}
