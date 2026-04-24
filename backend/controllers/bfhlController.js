const hierarchyService = require('../services/hierarchyService');

exports.processHierarchies = (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                is_success: false,
                message: "Input 'data' should be an array of strings"
            });
        }

        const result = hierarchyService.processEdges(data);

        res.json({
            user_id: "john_doe_17091999", // Replace with actual logic or static value as per req
            email_id: "john@xyz.com",
            college_roll_number: "SRM12345",
            ...result
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({
            is_success: false,
            message: "Internal server error"
        });
    }
};
