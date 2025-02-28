import Card from "react-bootstrap/Card";
import classes from "./edit-menu-item.module.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const categories = ["Appetizer", "Main Course", "Dessert", "Beverage"];

function EditMenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    allergens: "",
    createdAt: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          allergens: Array.isArray(data.allergens) ? data.allergens.join(", ") : "",
          createdAt: data.created_at || new Date().toISOString(),
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching menu item:", err.message);
        setError("Failed to load menu item.");
      }
    }
    fetchMenuItem();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const updatedItem = {
      ...itemData,
      allergens: itemData.allergens ? itemData.allergens.split(",").map((a) => a.trim()) : [],
    };

    try {
      const response = await fetch(`http://localhost:8018/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) throw new Error("Failed to update menu item.");

      alert("Menu item updated successfully!");
      navigate("/menu-management");
    } catch (err) {
      console.error("Error updating menu item:", err.message);
      setError("Failed to update item. Try again.");
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className={classes.error}>{error}</p>;

  return (
    <Card>
      <div className={classes.container}>
        <h1 className={classes.title}>✏️ Edit Menu Item</h1>
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
            <button type="submit">Update Item</button>
          </div>
        </form>
      </div>
    </Card>
  );
}

export default EditMenuItem;
