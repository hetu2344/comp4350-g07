/**
 * AddMenuItem Page
 * -----------------
 * This page allows staff members to add a new menu item to the system.
 * Users can:
 *  - Enter item details like name, description, price, and category.
 *  - Mark dietary attributes (vegetarian, vegan, gluten-free, available).
 *  - Select known allergens associated with the item.
 * 
 * On submission, the item is sent to the backend and saved in the menu database.
 * A success toast confirms the item is added, and the user is redirected to Menu Management.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import classes from "./edit-menu-item.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Menu categories
const categories = ["Appetizer", "Main Course", "Dessert", "Beverage"];

function AddMenuItem() {
  const navigate = useNavigate();

  // State to hold allergen list from API
  const [allergens, setAllergens] = useState([]);

  // State to track form input data
  const [itemData, setItemData] = useState({
    itemName: "",
    itemDescription: "",
    price: "",
    category: categories[0],
    isAvailable: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    allergens: [],
    createdAt: new Date().toISOString(),
  });

  const [error, setError] = useState(null);

  // Fetch allergens list on mount
  useEffect(() => {
    async function fetchAllergens() {
      try {
        const response = await fetch("http://localhost:8018/api/menu/allergens");
        if (!response.ok) throw new Error("Failed to fetch allergens.");
        const data = await response.json();
        setAllergens(data);
      } catch (err) {
        console.error("Error fetching allergens:", err.message);
      }
    }

    fetchAllergens();
  }, []);

  // Handle form submit: send new item to backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    const newItem = {
      ...itemData,
      price: parseFloat(itemData.price),
    };

    try {
      const response = await fetch("http://localhost:8018/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error("Failed to add menu item.");
      toast.success("Menu item added successfully!");

      // Redirect after success
      setTimeout(() => {
        navigate("/menu-management", { replace: true });
      }, 3000);
    } catch (err) {
      console.error("Error adding menu item:", err.message);
      setError("Failed to add item. Try again.");
    }
  };

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle allergen checkbox changes
  const handleAllergenChange = (event) => {
    const { value, checked } = event.target;
    setItemData((prevData) => ({
      ...prevData,
      allergens: checked
        ? [...prevData.allergens, value]
        : prevData.allergens.filter((allergen) => allergen !== value),
    }));
  };

  return (
    <>
      {/* Back to dashboard button */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🏠 Back to Dashboard
        </button>
      </div>

      {/* Add Menu Item Form */}
      <Card>
        <div className={classes.container}>
          <h1 className={classes.title}>➕ Add New Menu Item</h1>
          {error && <p className={classes.error}>{error}</p>}

          <form className={classes.form} onSubmit={handleSubmit}>
            <div className={classes.control}>
              <label>Item Name:</label>
              <input
                type="text"
                name="itemName"
                value={itemData.itemName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={classes.control}>
              <label>Description:</label>
              <textarea
                name="itemDescription"
                value={itemData.itemDescription}
                onChange={handleChange}
                required
              />
            </div>

            <div className={classes.control}>
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={itemData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className={classes.control}>
              <label>Category:</label>
              <select
                name="category"
                value={itemData.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Allergen checkboxes */}
            <div className={classes.control}>
              <label>Allergens:</label>
              <div className={classes.checkboxGroup}>
                {allergens.map((allergen) => (
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

            {/* Dietary and availability checkboxes */}
            <div className={classes.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={itemData.isAvailable}
                  onChange={handleChange}
                /> Available
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isVegetarian"
                  checked={itemData.isVegetarian}
                  onChange={handleChange}
                /> Vegetarian
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isVegan"
                  checked={itemData.isVegan}
                  onChange={handleChange}
                /> Vegan
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isGlutenFree"
                  checked={itemData.isGlutenFree}
                  onChange={handleChange}
                /> Gluten-Free
              </label>
            </div>

            {/* Submit button */}
            <div className={classes.actions}>
              <button type="submit">Add Item</button>
            </div>
          </form>
        </div>
      </Card>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default AddMenuItem;
