import Card from "react-bootstrap/Card"; 
import classes from "./menu-management.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/*
This component renders the Menu Management page, displays the menu items,
and provides Edit & Delete options for each item.
*/

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch Menu Items
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

    const handleDelete = async (id) => {
  
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost:8018/api/menu/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete item (Status: ${response.status})`);
      }

      setMenuItems((prevItems) => prevItems.filter((item) => item.item_id != id));
      console.log(`Item ${id} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting menu item:", err.message);
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  // Edit Menu Item
  const handleEdit = (id) => {
    navigate(`/edit-menu-item/${id}`);
  };
  const handleAdd = () => {
    navigate(`/add-menu-item`);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
        <button onClick={() => navigate("/dashboard")} style={{
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          🏠 Back to Dashboard
        </button>
      </div>
    <Card>
        <div className={classes.container}>
          <h1 className={classes.title}>📜 Menu Management</h1>
          <button className={classes.editBtn} onClick={() => handleAdd()}>Add item</button>
          {error && <p className={classes.error}>{error}</p>}
          <div className={classes.menuList}>
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item.item_id} className={classes.menuCard}>
                  <div className={classes.menuContent}>
                    <h3>{item.item_name}</h3>
                    <p className={classes.category}>{item.category_name}</p>
                    <p>{item.item_description}</p>
                    <p className={classes.price}><strong>Price:</strong> ${item.price}</p>
                  </div>
                  <div className={classes.actions}>
                    <button className={classes.editBtn} onClick={() => handleEdit(item.item_id)}>✏️ Edit</button>
                    <button className={classes.deleteBtn} onClick={() => handleDelete(item.item_id)}>🗑️ Delete</button>
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

export default MenuManagement;
