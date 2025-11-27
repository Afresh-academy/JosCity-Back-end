import { Request, Response } from 'express';
import db from '../../config/database';

interface AuthRequest extends Request {
  user?: {
    user_id: number;
  };
}

// Get all settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { group } = req.query;
    
    let whereClause = '';
    let queryParams: any[] = [];
    
    if (group) {
      whereClause = 'WHERE option_group = $1';
      queryParams.push(group);
    }
    
    const settingsResult = await db.query(
      `SELECT * FROM system_options ${whereClause} ORDER BY option_group, option_name`,
      queryParams
    );
    
    // Group settings by their groups
    const groupedSettings: any = {};
    settingsResult.rows.forEach((setting: any) => {
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
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update settings
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;
    
    for (const [optionName, optionValue] of Object.entries(settings)) {
      await db.query(
        'UPDATE system_options SET option_value = $1, updated_at = CURRENT_TIMESTAMP WHERE option_name = $2',
        [optionValue, optionName]
      );
    }
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'settings_update', 'Updated system settings']
    );
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Get registration settings
export const getRegistrationSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settingsResult = await db.query(
      "SELECT * FROM system_options WHERE option_group = 'registration' ORDER BY option_name"
    );
    
    res.json({
      success: true,
      data: settingsResult.rows
    });
  } catch (error) {
    console.error('Get registration settings error:', error);
    res.status(500).json({ error: 'Failed to fetch registration settings' });
  }
};

// Update registration settings
export const updateRegistrationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { registration_approval_required } = req.body;
    
    await db.query(
      "UPDATE system_options SET option_value = $1 WHERE option_name = 'registration_approval_required'",
      [registration_approval_required ? '1' : '0']
    );
    
    // Log admin action
    await db.query(
      'INSERT INTO admin_logs (admin_id, action_type, action_details) VALUES ($1, $2, $3)',
      [req.user!.user_id, 'settings_update', `Updated registration approval setting to: ${registration_approval_required}`]
    );
    
    res.json({
      success: true,
      message: 'Registration settings updated successfully'
    });
  } catch (error) {
    console.error('Update registration settings error:', error);
    res.status(500).json({ error: 'Failed to update registration settings' });
  }
};

