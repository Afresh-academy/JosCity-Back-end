"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRegistrationSettings = exports.getRegistrationSettings = exports.updateSettings = exports.getSettings = void 0;
const database_1 = __importDefault(require("../../config/database"));
// Get all settings
const getSettings = async (req, res) => {
    try {
        const { group } = req.query;
        let whereClause = '';
        let queryParams = [];
        if (group) {
            whereClause = 'WHERE option_group = $1';
            queryParams.push(group);
        }
        const settingsResult = await database_1.default.query(`SELECT * FROM system_options ${whereClause} ORDER BY option_group, option_name`, queryParams);
        // Group settings by their groups
        const groupedSettings = {};
        settingsResult.rows.forEach((setting) => {
            if (!groupedSettings[setting.option_group]) {
                groupedSettings[setting.option_group] = [];
            }
            groupedSettings[setting.option_group].push(setting);
        });
        res.json({
            success: true,
            data: groupedSettings,
            groups: Object.keys(groupedSettings)
        });
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};
exports.getSettings = getSettings;
// Update settings
const updateSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        for (const [optionName, optionValue] of Object.entries(settings)) {
            await database_1.default.query('UPDATE system_options SET option_value = $1, updated_at = CURRENT_TIMESTAMP WHERE option_name = $2', [optionValue, optionName]);
        }
        // Log admin action
        await database_1.default.query('INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)', [req.user.user_id, 'settings_update', 'Updated system settings']);
        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;
// Get registration settings
const getRegistrationSettings = async (_req, res) => {
    try {
        const settingsResult = await database_1.default.query("SELECT * FROM system_options WHERE option_group = 'registration' ORDER BY option_name");
        res.json({
            success: true,
            data: settingsResult.rows
        });
    }
    catch (error) {
        console.error('Get registration settings error:', error);
        res.status(500).json({ error: 'Failed to fetch registration settings' });
    }
};
exports.getRegistrationSettings = getRegistrationSettings;
// Update registration settings
const updateRegistrationSettings = async (req, res) => {
    try {
        const { registration_approval_required } = req.body;
        await database_1.default.query("UPDATE system_options SET option_value = $1 WHERE option_name = 'registration_approval_required'", [registration_approval_required ? '1' : '0']);
        // Log admin action
        await database_1.default.query('INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)', [req.user.user_id, 'settings_update', `Updated registration approval setting to: ${registration_approval_required}`]);
        res.json({
            success: true,
            message: 'Registration settings updated successfully'
        });
    }
    catch (error) {
        console.error('Update registration settings error:', error);
        res.status(500).json({ error: 'Failed to update registration settings' });
    }
};
exports.updateRegistrationSettings = updateRegistrationSettings;
//# sourceMappingURL=settingsController.js.map