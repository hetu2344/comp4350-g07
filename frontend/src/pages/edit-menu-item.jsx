/**
 * EditMenuItem Page
 * -------------------
 * This page allows users to edit an existing menu item.
 * 
 * Features:
 *  - Loads item details from the backend using its ID from the URL.
 *  - Pre-fills the form with existing data.
 *  - Allows editing of:
 *      - Name, description, price, category
 *      - Dietary attributes: vegetarian, vegan, gluten-free, available
 *      - Allergens
 * 
 * Upon saving, the updated item is sent via PUT to the backend.
 * Success/failure feedback is shown using toasts.
 */

import Card from "react-bootstrap/Card";
import classes from "./edit-menu-item.module.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Fixed list of item categories
const categories = ["Appetizer", "Main Course", "Dessert", "Beverage"];

function EditMenuItem() {
  const { id } = useParams(); // Extract menu item ID from URL
  const navigate = useNavigate();

  // Form data for the item
  const [itemData, setItemData] = useState({
    itemId: "",
    itemName: "",
    itemDescription: "",
    price: "",
    category: categories[0],
    isAvailable: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    allergens: [],
    createdAt: "",
  });

  const [allergensList, setAllergensList] = useState([]); // Allergen options
  const [error, setError] = useState(null);               // Error state
  const [loading, setLoading] = useState(true);           // Loading state

  // Fetch item data and allergens when component mounts
  useEffect(() => {
    async function fetchAllergens() {
      try {
        const response = await fetch("http://localhost:8018/api/menu/allergens");
        if (!response.ok) throw new Error("Failed to fetch allergens.");
        const data = await response.json();
        setAllergensList(data);
      } catch (err) {
        console.error("Error fetching allergens:", err.message);
      }
    }

    async function fetchMenuItem() {
      try {
        const response = await fetch(`http://localhost:8018/api/menu/${id}`);
        if (!response.ok) throw new Error("Failed to fetch menu item.");
        let data = await response.json();
        data = data[0];

        setItemData({
          itemId: data.item_id || id,
          itemName: data.item_name || "",
          itemDescription: data.item_description || "",
          price: data.price || "0.00",
          category: data.category_name || categories[0],
          isAvailable: data.is_available || false,
          isVegetarian: data.is_vegetarian || false,
          isVegan: data.is_vegan || false,
          isGlutenFree: data.is_gluten_free || false,
          allergens: Array.isArray(data.allergens) ? data.allergens : [],
          createdAt: data.created_at || new Date().toISOString(),
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching menu item:", err.message);
        setError("Failed to load menu item.");
        toast.error("Failed to load menu item.");
      }
    }

    fetchAllergens();
    fetchMenuItem();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const updatedItem = {
      ...itemData,
      allergens: itemData.allergens,
    };

    try {
      const response = await fetch(`http://localhost:8018/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) throw new Error("Failed to update menu item.");

      toast.success("Menu item updated successfully!");
      setTimeout(() => {
        navigate("/menu-management");
      }, 3000);
    } catch (err) {
      console.error("Error updating menu item:", err.message);
      setError("Failed to update item. Try again.");
      toast.error("Failed to update item. Try again.");
    }
  };

  // Handle input field changes (including checkboxes)
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle allergen checkbox toggles
  const handleAllergenChange = (event) => {
    const { value, checked } = event.target;
    setItemData((prevData) => ({
      ...prevData,
      allergens: checked
        ? [...prevData.allergens, value]
        : prevData.allergens.filter((allergen) => allergen !== value),
    }));
  };

  // Loading or error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p className={classes.error}>{error}</p>;

  return (
    <>
      {/* Back to dashboard shortcut */}
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
          <h1 className={classes.title}>✏️ Edit Menu Item</h1>
          
          <form className={classes.form} onSubmit={handleSubmit}>
            {/* Basic info */}
            <div className={classes.control}>
              <label>Item Name:</label>
              <input type="text" name="itemName" value={itemData.itemName} onChange={handleChange} required />
            </div>

            <div className={classes.control}>
              <label>Description:</label>
              <textarea name="itemDescription" value={itemData.itemDescription} onChange={handleChange} required />
            </div>

            <div className={classes.control}>
              <label>Price:</label>
              <input type="number" step="0.01" name="price" value={itemData.price} onChange={handleChange} required />
            </div>

            <div className={classes.control}>
              <label>Category:</label>
              <select name="category" value={itemData.category} onChange={handleChange} required>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Allergens */}
            <div className={classes.control}>
              <label>Allergens:</label>
              <div className={classes.checkboxGroup}>
                {allergensList.map((allergen) => (
                  <label key={allergen.id}>
                    <input
                      type="checkbox"
                      value={allergen.name}
                      checked={itemData.allergens.includes(allergen.name)}
                      onChange={handleAllergenChange}
                    />
                    {allergen.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary info */}
            <div className={classes.checkboxGroup}>
              <label><input type="checkbox" name="isAvailable" checked={itemData.isAvailable} onChange={handleChange} /> Available</label>
              <label><input type="checkbox" name="isVegetarian" checked={itemData.isVegetarian} onChange={handleChange} /> Vegetarian</label>
              <label><input type="checkbox" name="isVegan" checked={itemData.isVegan} onChange={handleChange} /> Vegan</label>
              <label><input type="checkbox" name="isGlutenFree" checked={itemData.isGlutenFree} onChange={handleChange} /> Gluten-Free</label>
            </div>

            {/* Submit */}
            <div className={classes.actions}>
              <button type="submit">Update Item</button>
            </div>
          </form>
        </div>
      </Card>

      {/* Toasts for success/error */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default EditMenuItem;
