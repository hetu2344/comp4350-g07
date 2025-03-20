import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import classes from "./edit-menu-item.module.css";

// Categories available for selection
const categories = ["Appetizer", "Main Course", "Dessert", "Beverage"];

function AddMenuItem() {
  const navigate = useNavigate();
  const [allergens, setAllergens] = useState([]); // Store fetched allergens
  const [itemData, setItemData] = useState({
    itemName: "",
    itemDescription: "",
    price: "",
    category: categories[0], // Default to first category
    isAvailable: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    allergens: [], // Now an array for checkboxes
    createdAt: new Date().toISOString(), // Ensure createdAt is always present
  });
  const [error, setError] = useState(null);

  // Fetch allergens from API
  useEffect(() => {
    async function fetchAllergens() {
      try {
        const response = await fetch("http://localhost:8018/api/menu/allergens");
        if (!response.ok) throw new Error("Failed to fetch allergens.");
        const data = await response.json();
        setAllergens(data); // Set allergens from API
      } catch (err) {
        console.error("Error fetching allergens:", err.message);
      }
    }
    fetchAllergens();
  }, []);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const newItem = {
      ...itemData,
      price: parseFloat(itemData.price), // Ensure price is stored as a number
    };

    try {
      const response = await fetch("http://localhost:8018/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

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

  // Handle allergen checkbox change
  const handleAllergenChange = (event) => {
    const { value, checked } = event.target;
    setItemData((prevData) => ({
      ...prevData,
      allergens: checked
        ? [...prevData.allergens, value] // Add allergen if checked
        : prevData.allergens.filter((allergen) => allergen !== value), // Remove if unchecked
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

          {/* Allergen checkboxes */}
          <div className={classes.control}>
            <label>Allergens:</label>
            <div className={classes.checkboxGroup}>
              {allergens.map((allergen) => (
                <label key={allergen}>
                  <input
                    type="checkbox"
                    value={allergen}
                    checked={itemData.allergens.includes(allergen)}
                    onChange={handleAllergenChange}
                  /> {allergen}
                </label>
              ))}
            </div>
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
