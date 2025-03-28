/**
 * MenuManagement Page
 * ---------------------
 * This page allows Store Owners and Managers to manage the restaurant's menu.
 *
 * Features:
 *  - Fetch and display all current menu items.
 *  - Add new items via the "Add item" button.
 *  - Edit existing items (navigates to Edit Menu Item page).
 *  - Delete items with confirmation and instant update.
 *
 * Role Access:
 *  - S: Store Owner
 *  - M: Manager
 */

import Card from "react-bootstrap/Card";
import classes from "./menu-management.module.css";
import RoleProtection from "../components/security/RoleProtection";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuManagementNavigation from "../components/layout/MenuManagementNavigation";

function MenuManagement({ user }) {
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch menu items when the component mounts
  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch("http://localhost:8018/api/menu");
        if (!response.ok) throw new Error("Failed to fetch menu");
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu:", err.message);
        setError("Failed to load menu. Please try again.");
      }
    }
    fetchMenu();
  }, []);

  // Navigate to the edit form for a specific item
  const handleEdit = (id) => {
    navigate(`/edit-menu-item/${id}`);
  };

  // Navigate to the add menu item form
  const handleAdd = () => {
    navigate(`/add-menu-item`);
  };

  // Handle deleting a menu item with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost:8018/api/menu/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to delete item (Status: ${response.status})`
        );
      }

      // Update UI after successful deletion
      setMenuItems((prevItems) =>
        prevItems.filter((item) => item.item_id !== id)
      );
      console.log(`Item ${id} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting menu item:", err.message);
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  return (
    <>
      {/* Top navigation for menu management section */}
      <MenuManagementNavigation />

      <Card>
        <div className={classes.container}>
          <h1 className={classes.title}>📜 Menu Management</h1>

          {/* Add item button */}
          <button className={classes.editBtn} onClick={handleAdd}>
            ➕ Add item
          </button>

          {/* Error display */}
          {error && <p className={classes.error}>{error}</p>}

          {/* List of menu items */}
          <div className={classes.menuList}>
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item.item_id} className={classes.menuCard}>
                  <div className={classes.menuContent}>
                    <h3>{item.item_name}</h3>
                    <p className={classes.category}>{item.category_name}</p>
                    <p>{item.item_description}</p>
                    <p className={classes.price}>
                      <strong>Price:</strong> ${item.price}
                    </p>
                  </div>

                  {/* Edit/Delete actions */}
                  <div className={classes.actions}>
                    <button
                      className={classes.editBtn}
                      onClick={() => handleEdit(item.item_id)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={classes.deleteBtn}
                      onClick={() => handleDelete(item.item_id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={classes.noItems}>No menu items available.</p>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

// Restrict access to Store Owners (S) and Managers (M)
export default RoleProtection(MenuManagement, ["S", "M"]);
