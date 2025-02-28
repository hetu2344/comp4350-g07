import Card from "react-bootstrap/Card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./edit-menu-item.module.css";

// Categories available for selection
const categories = ["Appetizer", "Main Course", "Dessert", "Beverage"];

function AddMenuItem() {
  const navigate = useNavigate();

  const [itemData, setItemData] = useState({
    itemName: "",
    itemDescription: "",
    price: "",
    category: categories[0], // Default to first category
    isAvailable: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    allergens: "",
    createdAt: new Date().toISOString(), // Ensure createdAt is always present
  });

  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Convert allergens string to an array
    const newItem = {
      ...itemData,
      allergens: itemData.allergens ? itemData.allergens.split(",").map((a) => a.trim()) : [],
      price: parseFloat(itemData.price), // Ensure price is stored as a number
    };

    try {
      const response = await fetch("http://localhost:8018/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      console.log("Sent Payload:", newItem);

      if (!response.ok) throw new Error("Failed to add menu item.");

      alert("Menu item added successfully!");
      navigate("/menu-management");
    } catch (err) {
      console.error("Error adding menu item:", err.message);
      setError("Failed to add item. Try again.");
    }
  };

  // Handle input changes
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Card>
      <div className={classes.container}>
        <h1 className={classes.title}>➕ Add New Menu Item</h1>
        {error && <p className={classes.error}>{error}</p>}
        <form className={classes.form} onSubmit={handleSubmit}>
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
          <div className={classes.control}>
            <label>Allergens (comma-separated):</label>
            <input type="text" name="allergens" value={itemData.allergens} onChange={handleChange} />
          </div>
          <div className={classes.checkboxGroup}>
            <label><input type="checkbox" name="isAvailable" checked={itemData.isAvailable} onChange={handleChange} /> Available</label>
            <label><input type="checkbox" name="isVegetarian" checked={itemData.isVegetarian} onChange={handleChange} /> Vegetarian</label>
            <label><input type="checkbox" name="isVegan" checked={itemData.isVegan} onChange={handleChange} /> Vegan</label>
            <label><input type="checkbox" name="isGlutenFree" checked={itemData.isGlutenFree} onChange={handleChange} /> Gluten-Free</label>
          </div>
          <div className={classes.actions}>
            <button type="submit">Add Item</button>
          </div>
        </form>
      </div>
    </Card>
  );
}

export default AddMenuItem;