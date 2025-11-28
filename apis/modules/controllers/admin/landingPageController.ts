import { Request, Response } from "express";
import db from "../../config/database";

// ============================================
// NAVBAR CONTROLLERS
// ============================================

export const getNavbarMenuItems = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM navbar_menu_items ORDER BY display_order ASC, created_at ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get navbar menu items error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch navbar menu items" });
  }
};

export const createNavbarMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      label,
      link_type,
      link_target,
      scroll_target_id,
      display_order,
      is_active,
      requires_auth,
      icon_name,
    } = req.body;

    const result = await db.query(
      `INSERT INTO navbar_menu_items (label, link_type, link_target, scroll_target_id, display_order, is_active, requires_auth, icon_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        label,
        link_type,
        link_target || null,
        scroll_target_id || null,
        display_order || 0,
        is_active !== false,
        requires_auth || false,
        icon_name || null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Create navbar menu item error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create navbar menu item" });
  }
};

export const updateNavbarMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      label,
      link_type,
      link_target,
      scroll_target_id,
      display_order,
      is_active,
      requires_auth,
      icon_name,
    } = req.body;

    const result = await db.query(
      `UPDATE navbar_menu_items 
       SET label = $1, link_type = $2, link_target = $3, scroll_target_id = $4, 
           display_order = $5, is_active = $6, requires_auth = $7, icon_name = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        label,
        link_type,
        link_target || null,
        scroll_target_id || null,
        display_order,
        is_active,
        requires_auth,
        icon_name || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Navbar menu item not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update navbar menu item error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update navbar menu item" });
  }
};

export const deleteNavbarMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM navbar_menu_items WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Navbar menu item not found" });
      return;
    }

    res.json({
      success: true,
      message: "Navbar menu item deleted successfully",
    });
  } catch (error) {
    console.error("Delete navbar menu item error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete navbar menu item" });
  }
};

export const getNavbarSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM navbar_settings ORDER BY updated_at DESC LIMIT 1"
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Get navbar settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch navbar settings" });
  }
};

export const updateNavbarSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      logo_url,
      logo_alt,
      get_started_button_text,
      get_started_button_route,
      is_active,
    } = req.body;

    // Check if settings exist
    const existing = await db.query("SELECT id FROM navbar_settings LIMIT 1");

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE navbar_settings 
         SET logo_url = $1, logo_alt = $2, get_started_button_text = $3, 
             get_started_button_route = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [
          logo_url || null,
          logo_alt || null,
          get_started_button_text || null,
          get_started_button_route || null,
          is_active !== false,
          existing.rows[0].id,
        ]
      );
    } else {
      result = await db.query(
        `INSERT INTO navbar_settings (logo_url, logo_alt, get_started_button_text, get_started_button_route, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          logo_url || null,
          logo_alt || null,
          get_started_button_text || null,
          get_started_button_route || null,
          is_active !== false,
        ]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update navbar settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update navbar settings" });
  }
};

// ============================================
// CONTACT CONTROLLERS
// ============================================

export const getContactSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM contact_page_settings ORDER BY updated_at DESC LIMIT 1"
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Get contact settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch contact settings" });
  }
};

export const updateContactSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { badge_text, heading, subheading } = req.body;

    const existing = await db.query(
      "SELECT id FROM contact_page_settings LIMIT 1"
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE contact_page_settings 
         SET badge_text = $1, heading = $2, subheading = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [badge_text || null, heading, subheading || null, existing.rows[0].id]
      );
    } else {
      result = await db.query(
        `INSERT INTO contact_page_settings (badge_text, heading, subheading)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [badge_text || null, heading, subheading || null]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update contact settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update contact settings" });
  }
};

export const getContactMessages = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get contact messages error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch contact messages" });
  }
};

export const getContactMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM contact_messages WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Contact message not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Get contact message error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch contact message" });
  }
};

export const updateContactMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reply_message } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }

    if (reply_message !== undefined) {
      updateFields.push(`reply_message = $${paramCount++}`);
      updateValues.push(reply_message);
      if (status === "replied") {
        updateFields.push(`replied_at = CURRENT_TIMESTAMP`);
      }
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE contact_messages 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Contact message not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update contact message error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update contact message" });
  }
};

export const deleteContactMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM contact_messages WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Contact message not found" });
      return;
    }

    res.json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact message error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete contact message" });
  }
};

export const getContactInformation = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM contact_information ORDER BY display_order ASC, created_at ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get contact information error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch contact information" });
  }
};

export const createContactInformation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      contact_type,
      title,
      primary_value,
      secondary_value,
      icon_color,
      icon_background,
      is_active,
      display_order,
    } = req.body;

    const result = await db.query(
      `INSERT INTO contact_information (contact_type, title, primary_value, secondary_value, icon_color, icon_background, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        contact_type,
        title,
        primary_value,
        secondary_value || null,
        icon_color || null,
        icon_background || null,
        is_active !== false,
        display_order || 0,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Create contact information error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create contact information" });
  }
};

export const updateContactInformation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      contact_type,
      title,
      primary_value,
      secondary_value,
      icon_color,
      icon_background,
      is_active,
      display_order,
    } = req.body;

    const result = await db.query(
      `UPDATE contact_information 
       SET contact_type = $1, title = $2, primary_value = $3, secondary_value = $4, 
           icon_color = $5, icon_background = $6, is_active = $7, display_order = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        contact_type,
        title,
        primary_value,
        secondary_value || null,
        icon_color || null,
        icon_background || null,
        is_active,
        display_order,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Contact information not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update contact information error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update contact information" });
  }
};

export const deleteContactInformation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM contact_information WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Contact information not found" });
      return;
    }

    res.json({
      success: true,
      message: "Contact information deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact information error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete contact information" });
  }
};

// ============================================
// EVENTS CONTROLLERS
// ============================================

export const getEventsSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM events_page_settings ORDER BY updated_at DESC LIMIT 1"
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Get events settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch events settings" });
  }
};

export const updateEventsSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { badge_text, heading, subheading, default_image_url } = req.body;

    const existing = await db.query(
      "SELECT id FROM events_page_settings LIMIT 1"
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE events_page_settings 
         SET badge_text = $1, heading = $2, subheading = $3, default_image_url = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [
          badge_text || null,
          heading || null,
          subheading || null,
          default_image_url || null,
          existing.rows[0].id,
        ]
      );
    } else {
      result = await db.query(
        `INSERT INTO events_page_settings (badge_text, heading, subheading, default_image_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          badge_text || null,
          heading || null,
          subheading || null,
          default_image_url || null,
        ]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update events settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update events settings" });
  }
};

export const getEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM events ORDER BY event_date ASC, created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
};

export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM events WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Event not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch event" });
  }
};

export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      event_date,
      event_time,
      end_date,
      end_time,
      location,
      venue,
      image_url,
      event_type,
      status,
      max_attendees,
      ticket_price,
      ticket_currency,
      registration_required,
      registration_deadline,
      tags,
    } = req.body;

    const result = await db.query(
      `INSERT INTO events (title, description, event_date, event_time, end_date, end_time, location, venue,
                          image_url, event_type, status, max_attendees, ticket_price, ticket_currency,
                          registration_required, registration_deadline, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        title,
        description || null,
        event_date,
        event_time || null,
        end_date || null,
        end_time || null,
        location || null,
        venue || null,
        image_url || null,
        event_type || null,
        status || "upcoming",
        max_attendees || null,
        ticket_price || null,
        ticket_currency || "NGN",
        registration_required || false,
        registration_deadline || null,
        tags || null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ success: false, error: "Failed to create event" });
  }
};

export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      event_date,
      event_time,
      end_date,
      end_time,
      location,
      venue,
      image_url,
      event_type,
      status,
      max_attendees,
      current_attendees,
      ticket_price,
      ticket_currency,
      registration_required,
      registration_deadline,
      tags,
    } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (event_date !== undefined) {
      updateFields.push(`event_date = $${paramCount++}`);
      updateValues.push(event_date);
    }
    if (event_time !== undefined) {
      updateFields.push(`event_time = $${paramCount++}`);
      updateValues.push(event_time);
    }
    if (end_date !== undefined) {
      updateFields.push(`end_date = $${paramCount++}`);
      updateValues.push(end_date);
    }
    if (end_time !== undefined) {
      updateFields.push(`end_time = $${paramCount++}`);
      updateValues.push(end_time);
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramCount++}`);
      updateValues.push(location);
    }
    if (venue !== undefined) {
      updateFields.push(`venue = $${paramCount++}`);
      updateValues.push(venue);
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCount++}`);
      updateValues.push(image_url);
    }
    if (event_type !== undefined) {
      updateFields.push(`event_type = $${paramCount++}`);
      updateValues.push(event_type);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }
    if (max_attendees !== undefined) {
      updateFields.push(`max_attendees = $${paramCount++}`);
      updateValues.push(max_attendees);
    }
    if (current_attendees !== undefined) {
      updateFields.push(`current_attendees = $${paramCount++}`);
      updateValues.push(current_attendees);
    }
    if (ticket_price !== undefined) {
      updateFields.push(`ticket_price = $${paramCount++}`);
      updateValues.push(ticket_price);
    }
    if (ticket_currency !== undefined) {
      updateFields.push(`ticket_currency = $${paramCount++}`);
      updateValues.push(ticket_currency);
    }
    if (registration_required !== undefined) {
      updateFields.push(`registration_required = $${paramCount++}`);
      updateValues.push(registration_required);
    }
    if (registration_deadline !== undefined) {
      updateFields.push(`registration_deadline = $${paramCount++}`);
      updateValues.push(registration_deadline);
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${paramCount++}`);
      updateValues.push(tags);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE events SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Event not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ success: false, error: "Failed to update event" });
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM events WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Event not found" });
      return;
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ success: false, error: "Failed to delete event" });
  }
};

export const getEventRegistrations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    let query = "SELECT * FROM event_registrations";
    const params: any[] = [];

    if (eventId) {
      query += " WHERE event_id = $1";
      params.push(eventId);
    }

    query += " ORDER BY registration_date DESC";

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get event registrations error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch event registrations" });
  }
};

export const updateEventRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, payment_status, checked_in_at, notes } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }
    if (payment_status !== undefined) {
      updateFields.push(`payment_status = $${paramCount++}`);
      updateValues.push(payment_status);
    }
    if (checked_in_at !== undefined) {
      updateFields.push(`checked_in_at = $${paramCount++}`);
      updateValues.push(checked_in_at);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount++}`);
      updateValues.push(notes);
    }

    updateValues.push(id);

    const result = await db.query(
      `UPDATE event_registrations SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Event registration not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update event registration error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update event registration" });
  }
};

// ============================================
// SERVICES CONTROLLERS
// ============================================

export const getServicesSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM services_page_settings ORDER BY updated_at DESC LIMIT 1"
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Get services settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch services settings" });
  }
};

export const updateServicesSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { badge_text, heading, subheading, view_all_button_text } = req.body;

    const existing = await db.query(
      "SELECT id FROM services_page_settings LIMIT 1"
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE services_page_settings 
         SET badge_text = $1, heading = $2, subheading = $3, view_all_button_text = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [
          badge_text || null,
          heading,
          subheading || null,
          view_all_button_text || null,
          existing.rows[0].id,
        ]
      );
    } else {
      result = await db.query(
        `INSERT INTO services_page_settings (badge_text, heading, subheading, view_all_button_text)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          badge_text || null,
          heading,
          subheading || null,
          view_all_button_text || null,
        ]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update services settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update services settings" });
  }
};

export const getServices = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM services ORDER BY display_order ASC, created_at ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch services" });
  }
};

export const getService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM services WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Service not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch service" });
  }
};

export const createService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      service_key,
      title,
      description,
      icon_color,
      icon_svg,
      category,
      is_active,
      display_order,
      service_url,
      requires_authentication,
    } = req.body;

    const result = await db.query(
      `INSERT INTO services (service_key, title, description, icon_color, icon_svg, category, is_active, display_order, service_url, requires_authentication)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        service_key,
        title,
        description,
        icon_color,
        icon_svg || null,
        category || null,
        is_active !== false,
        display_order || 0,
        service_url || null,
        requires_authentication || false,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Create service error:", error);
    if (error.code === "23505") {
      // Unique violation
      res
        .status(400)
        .json({ success: false, error: "Service key already exists" });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to create service" });
    }
  }
};

export const updateService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      service_key,
      title,
      description,
      icon_color,
      icon_svg,
      category,
      is_active,
      display_order,
      service_url,
      requires_authentication,
    } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (service_key !== undefined) {
      updateFields.push(`service_key = $${paramCount++}`);
      updateValues.push(service_key);
    }
    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (icon_color !== undefined) {
      updateFields.push(`icon_color = $${paramCount++}`);
      updateValues.push(icon_color);
    }
    if (icon_svg !== undefined) {
      updateFields.push(`icon_svg = $${paramCount++}`);
      updateValues.push(icon_svg);
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramCount++}`);
      updateValues.push(category);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramCount++}`);
      updateValues.push(display_order);
    }
    if (service_url !== undefined) {
      updateFields.push(`service_url = $${paramCount++}`);
      updateValues.push(service_url);
    }
    if (requires_authentication !== undefined) {
      updateFields.push(`requires_authentication = $${paramCount++}`);
      updateValues.push(requires_authentication);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE services SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Service not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Update service error:", error);
    if (error.code === "23505") {
      res
        .status(400)
        .json({ success: false, error: "Service key already exists" });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to update service" });
    }
  }
};

export const deleteService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM services WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Service not found" });
      return;
    }

    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    console.error("Delete service error:", error);
    if (error.code === "23503") {
      // Foreign key violation
      res.status(400).json({
        success: false,
        error: "Cannot delete service with existing requests",
      });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to delete service" });
    }
  }
};

export const getServiceRequests = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM service_requests ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get service requests error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch service requests" });
  }
};

export const updateServiceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, priority, assigned_to, response, completed_at } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
      if (status === "completed" && !completed_at) {
        updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      updateValues.push(priority);
    }
    if (assigned_to !== undefined) {
      updateFields.push(`assigned_to = $${paramCount++}`);
      updateValues.push(assigned_to);
    }
    if (response !== undefined) {
      updateFields.push(`response = $${paramCount++}`);
      updateValues.push(response);
    }
    if (completed_at !== undefined) {
      updateFields.push(`completed_at = $${paramCount++}`);
      updateValues.push(completed_at);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE service_requests SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Service request not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update service request error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update service request" });
  }
};

// ============================================
// PRICING CONTROLLERS
// ============================================

export const getPricingSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM pricing_page_settings ORDER BY updated_at DESC LIMIT 1"
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Get pricing settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch pricing settings" });
  }
};

export const updatePricingSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { badge_text, heading, subheading, subscribe_button_text } = req.body;

    const existing = await db.query(
      "SELECT id FROM pricing_page_settings LIMIT 1"
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE pricing_page_settings 
         SET badge_text = $1, heading = $2, subheading = $3, subscribe_button_text = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [
          badge_text || null,
          heading,
          subheading || null,
          subscribe_button_text || null,
          existing.rows[0].id,
        ]
      );
    } else {
      result = await db.query(
        `INSERT INTO pricing_page_settings (badge_text, heading, subheading, subscribe_button_text)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          badge_text || null,
          heading,
          subheading || null,
          subscribe_button_text || null,
        ]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update pricing settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update pricing settings" });
  }
};

export const getPricingPlans = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM pricing_plans ORDER BY display_order ASC, created_at ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get pricing plans error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch pricing plans" });
  }
};

export const getPricingPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM pricing_plans WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Pricing plan not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Get pricing plan error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch pricing plan" });
  }
};

export const createPricingPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      plan_key,
      name,
      price,
      currency,
      billing_period,
      is_popular,
      is_active,
      display_order,
      description,
    } = req.body;

    const result = await db.query(
      `INSERT INTO pricing_plans (plan_key, name, price, currency, billing_period, is_popular, is_active, display_order, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        plan_key,
        name,
        price,
        currency || "NGN",
        billing_period || "monthly",
        is_popular || false,
        is_active !== false,
        display_order || 0,
        description || null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Create pricing plan error:", error);
    if (error.code === "23505") {
      res
        .status(400)
        .json({ success: false, error: "Plan key already exists" });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to create pricing plan" });
    }
  }
};

export const updatePricingPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      plan_key,
      name,
      price,
      currency,
      billing_period,
      is_popular,
      is_active,
      display_order,
      description,
    } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (plan_key !== undefined) {
      updateFields.push(`plan_key = $${paramCount++}`);
      updateValues.push(plan_key);
    }
    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramCount++}`);
      updateValues.push(price);
    }
    if (currency !== undefined) {
      updateFields.push(`currency = $${paramCount++}`);
      updateValues.push(currency);
    }
    if (billing_period !== undefined) {
      updateFields.push(`billing_period = $${paramCount++}`);
      updateValues.push(billing_period);
    }
    if (is_popular !== undefined) {
      updateFields.push(`is_popular = $${paramCount++}`);
      updateValues.push(is_popular);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramCount++}`);
      updateValues.push(display_order);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE pricing_plans SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Pricing plan not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Update pricing plan error:", error);
    if (error.code === "23505") {
      res
        .status(400)
        .json({ success: false, error: "Plan key already exists" });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to update pricing plan" });
    }
  }
};

export const deletePricingPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM pricing_plans WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Pricing plan not found" });
      return;
    }

    res.json({ success: true, message: "Pricing plan deleted successfully" });
  } catch (error: any) {
    console.error("Delete pricing plan error:", error);
    if (error.code === "23503") {
      res.status(400).json({
        success: false,
        error: "Cannot delete plan with existing subscriptions or features",
      });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to delete pricing plan" });
    }
  }
};

export const getPricingPlanFeatures = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { planId } = req.params;
    const result = await db.query(
      "SELECT * FROM pricing_plan_features WHERE plan_id = $1 ORDER BY display_order ASC",
      [planId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get pricing plan features error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch pricing plan features" });
  }
};

export const createPricingPlanFeature = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { plan_id, feature_name, is_included, display_order } = req.body;

    const result = await db.query(
      `INSERT INTO pricing_plan_features (plan_id, feature_name, is_included, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [plan_id, feature_name, is_included !== false, display_order || 0]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Create pricing plan feature error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create pricing plan feature" });
  }
};

export const updatePricingPlanFeature = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { feature_name, is_included, display_order } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (feature_name !== undefined) {
      updateFields.push(`feature_name = $${paramCount++}`);
      updateValues.push(feature_name);
    }
    if (is_included !== undefined) {
      updateFields.push(`is_included = $${paramCount++}`);
      updateValues.push(is_included);
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramCount++}`);
      updateValues.push(display_order);
    }

    updateValues.push(id);

    const result = await db.query(
      `UPDATE pricing_plan_features SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Pricing plan feature not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update pricing plan feature error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update pricing plan feature" });
  }
};

export const deletePricingPlanFeature = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM pricing_plan_features WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Pricing plan feature not found" });
      return;
    }

    res.json({
      success: true,
      message: "Pricing plan feature deleted successfully",
    });
  } catch (error) {
    console.error("Delete pricing plan feature error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete pricing plan feature" });
  }
};

export const getUserSubscriptions = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM user_subscriptions ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get user subscriptions error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch user subscriptions" });
  }
};

export const updateUserSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, auto_renew, payment_status, end_date } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }
    if (auto_renew !== undefined) {
      updateFields.push(`auto_renew = $${paramCount++}`);
      updateValues.push(auto_renew);
    }
    if (payment_status !== undefined) {
      updateFields.push(`payment_status = $${paramCount++}`);
      updateValues.push(payment_status);
    }
    if (end_date !== undefined) {
      updateFields.push(`end_date = $${paramCount++}`);
      updateValues.push(end_date);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE user_subscriptions SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "User subscription not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update user subscription error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update user subscription" });
  }
};

// ============================================
// GUIDELINES CONTROLLERS
// ============================================

export const getGuidelinesSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM guidelines_page_settings ORDER BY updated_at DESC LIMIT 1"
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Get guidelines settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch guidelines settings" });
  }
};

export const updateGuidelinesSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { badge_text, heading } = req.body;

    const existing = await db.query(
      "SELECT id FROM guidelines_page_settings LIMIT 1"
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE guidelines_page_settings 
         SET badge_text = $1, heading = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [badge_text || null, heading || null, existing.rows[0].id]
      );
    } else {
      result = await db.query(
        `INSERT INTO guidelines_page_settings (badge_text, heading)
         VALUES ($1, $2)
         RETURNING *`,
        [badge_text || null, heading || null]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update guidelines settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update guidelines settings" });
  }
};

export const getGuidelines = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM guidelines ORDER BY display_order ASC, created_at ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get guidelines error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch guidelines" });
  }
};

export const getGuideline = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM guidelines WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Guideline not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Get guideline error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch guideline" });
  }
};

export const createGuideline = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      quote,
      author_name,
      author_role,
      rating,
      author_image_url,
      display_order,
      is_active,
    } = req.body;

    const result = await db.query(
      `INSERT INTO guidelines (quote, author_name, author_role, rating, author_image_url, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        quote,
        author_name,
        author_role || null,
        rating || 5,
        author_image_url || null,
        display_order || 0,
        is_active !== false,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Create guideline error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create guideline" });
  }
};

export const updateGuideline = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      quote,
      author_name,
      author_role,
      rating,
      author_image_url,
      display_order,
      is_active,
    } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (quote !== undefined) {
      updateFields.push(`quote = $${paramCount++}`);
      updateValues.push(quote);
    }
    if (author_name !== undefined) {
      updateFields.push(`author_name = $${paramCount++}`);
      updateValues.push(author_name);
    }
    if (author_role !== undefined) {
      updateFields.push(`author_role = $${paramCount++}`);
      updateValues.push(author_role);
    }
    if (rating !== undefined) {
      updateFields.push(`rating = $${paramCount++}`);
      updateValues.push(rating);
    }
    if (author_image_url !== undefined) {
      updateFields.push(`author_image_url = $${paramCount++}`);
      updateValues.push(author_image_url);
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramCount++}`);
      updateValues.push(display_order);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE guidelines SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Guideline not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update guideline error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update guideline" });
  }
};

export const deleteGuideline = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM guidelines WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Guideline not found" });
      return;
    }

    res.json({ success: true, message: "Guideline deleted successfully" });
  } catch (error) {
    console.error("Delete guideline error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete guideline" });
  }
};

// ============================================
// HERO CONTROLLERS
// ============================================

export const getHeroSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM hero_page_settings ORDER BY updated_at DESC LIMIT 1"
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Get hero settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch hero settings" });
  }
};

export const updateHeroSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      slide_duration_seconds,
      auto_advance,
      show_navigation_dots,
      show_prev_next_arrows,
      default_badge_text,
      primary_button_text,
      primary_button_route,
      secondary_button_text,
      secondary_button_route,
    } = req.body;

    const existing = await db.query(
      "SELECT id FROM hero_page_settings LIMIT 1"
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE hero_page_settings 
         SET slide_duration_seconds = $1, auto_advance = $2, show_navigation_dots = $3, show_prev_next_arrows = $4,
             default_badge_text = $5, primary_button_text = $6, primary_button_route = $7, 
             secondary_button_text = $8, secondary_button_route = $9, updated_at = CURRENT_TIMESTAMP
         WHERE id = $10
         RETURNING *`,
        [
          slide_duration_seconds || 5,
          auto_advance !== false,
          show_navigation_dots !== false,
          show_prev_next_arrows !== false,
          default_badge_text || null,
          primary_button_text || null,
          primary_button_route || null,
          secondary_button_text || null,
          secondary_button_route || null,
          existing.rows[0].id,
        ]
      );
    } else {
      result = await db.query(
        `INSERT INTO hero_page_settings (slide_duration_seconds, auto_advance, show_navigation_dots, show_prev_next_arrows,
                                         default_badge_text, primary_button_text, primary_button_route, 
                                         secondary_button_text, secondary_button_route)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          slide_duration_seconds || 5,
          auto_advance !== false,
          show_navigation_dots !== false,
          show_prev_next_arrows !== false,
          default_badge_text || null,
          primary_button_text || null,
          primary_button_route || null,
          secondary_button_text || null,
          secondary_button_route || null,
        ]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update hero settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update hero settings" });
  }
};

export const getHeroSlides = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM hero_slides ORDER BY slide_order ASC, created_at ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get hero slides error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch hero slides" });
  }
};

export const getHeroSlide = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM hero_slides WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Hero slide not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Get hero slide error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch hero slide" });
  }
};

export const createHeroSlide = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      subtitle,
      description,
      image_url,
      image_alt,
      slide_order,
      is_active,
      link_url,
      link_text,
      button_text,
    } = req.body;

    const result = await db.query(
      `INSERT INTO hero_slides (title, subtitle, description, image_url, image_alt, slide_order, is_active, link_url, link_text, button_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title,
        subtitle || null,
        description || null,
        image_url,
        image_alt || null,
        slide_order || 0,
        is_active !== false,
        link_url || null,
        link_text || null,
        button_text || null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Create hero slide error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create hero slide" });
  }
};

export const updateHeroSlide = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      image_url,
      image_alt,
      slide_order,
      is_active,
      link_url,
      link_text,
      button_text,
    } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(title);
    }
    if (subtitle !== undefined) {
      updateFields.push(`subtitle = $${paramCount++}`);
      updateValues.push(subtitle);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCount++}`);
      updateValues.push(image_url);
    }
    if (image_alt !== undefined) {
      updateFields.push(`image_alt = $${paramCount++}`);
      updateValues.push(image_alt);
    }
    if (slide_order !== undefined) {
      updateFields.push(`slide_order = $${paramCount++}`);
      updateValues.push(slide_order);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }
    if (link_url !== undefined) {
      updateFields.push(`link_url = $${paramCount++}`);
      updateValues.push(link_url);
    }
    if (link_text !== undefined) {
      updateFields.push(`link_text = $${paramCount++}`);
      updateValues.push(link_text);
    }
    if (button_text !== undefined) {
      updateFields.push(`button_text = $${paramCount++}`);
      updateValues.push(button_text);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE hero_slides SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Hero slide not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update hero slide error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update hero slide" });
  }
};

export const deleteHeroSlide = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM hero_slides WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Hero slide not found" });
      return;
    }

    res.json({ success: true, message: "Hero slide deleted successfully" });
  } catch (error) {
    console.error("Delete hero slide error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete hero slide" });
  }
};

// ============================================
// FOOTER CONTROLLERS
// ============================================

export const getFooterSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM footer_settings ORDER BY updated_at DESC LIMIT 1"
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error("Get footer settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch footer settings" });
  }
};

export const updateFooterSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { logo_url, tagline, copyright_text, social_media } = req.body;

    const existing = await db.query("SELECT id FROM footer_settings LIMIT 1");

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE footer_settings 
         SET logo_url = $1, tagline = $2, copyright_text = $3, social_media = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [
          logo_url || null,
          tagline || null,
          copyright_text || null,
          social_media ? JSON.stringify(social_media) : null,
          existing.rows[0].id,
        ]
      );
    } else {
      result = await db.query(
        `INSERT INTO footer_settings (logo_url, tagline, copyright_text, social_media)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          logo_url || null,
          tagline || null,
          copyright_text || null,
          social_media ? JSON.stringify(social_media) : null,
        ]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update footer settings error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update footer settings" });
  }
};

export const getFooterLinks = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.query(
      "SELECT * FROM footer_links ORDER BY section, display_order ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get footer links error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch footer links" });
  }
};

export const createFooterLink = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      link_text,
      link_url,
      section,
      display_order,
      is_active,
      opens_in_new_tab,
    } = req.body;

    const result = await db.query(
      `INSERT INTO footer_links (link_text, link_url, section, display_order, is_active, opens_in_new_tab)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        link_text,
        link_url,
        section,
        display_order || 0,
        is_active !== false,
        opens_in_new_tab || false,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Create footer link error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create footer link" });
  }
};

export const updateFooterLink = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      link_text,
      link_url,
      section,
      display_order,
      is_active,
      opens_in_new_tab,
    } = req.body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (link_text !== undefined) {
      updateFields.push(`link_text = $${paramCount++}`);
      updateValues.push(link_text);
    }
    if (link_url !== undefined) {
      updateFields.push(`link_url = $${paramCount++}`);
      updateValues.push(link_url);
    }
    if (section !== undefined) {
      updateFields.push(`section = $${paramCount++}`);
      updateValues.push(section);
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramCount++}`);
      updateValues.push(display_order);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }
    if (opens_in_new_tab !== undefined) {
      updateFields.push(`opens_in_new_tab = $${paramCount++}`);
      updateValues.push(opens_in_new_tab);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE footer_links SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Footer link not found" });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update footer link error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update footer link" });
  }
};

export const deleteFooterLink = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM footer_links WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Footer link not found" });
      return;
    }

    res.json({ success: true, message: "Footer link deleted successfully" });
  } catch (error) {
    console.error("Delete footer link error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete footer link" });
  }
};

// ============================================
// STATS CONTROLLERS
// ============================================

export const getRegisteredCitizensCount = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Count all approved users (both personal and business)
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE account_status = 'approved'`
    );

    const count = parseInt(result.rows[0].count, 10) || 0;

    res.json({
      success: true,
      data: {
        count: count,
        formatted: formatCount(count),
      },
    });
  } catch (error) {
    console.error("Get registered citizens count error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch registered citizens count",
    });
  }
};

// Helper function to format count (e.g., 500000 -> "500K+")
function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M+`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K+`;
  }
  return count.toString();
}
