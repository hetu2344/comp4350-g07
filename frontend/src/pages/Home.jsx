import { useState, useEffect } from "react";
import HomePageNavigation from "../components/layout/HomePageNavigation";

function HomePage() {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch("http://localhost:8018/api/menu", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMenu(data);
      } catch (error) {
        console.error("Error fetching menu items:", error.message);
        setError("Failed to fetch menu items. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <HomePageNavigation />
      <h2>Welcome to RestroSync</h2>
      <h3>Our Delicious Menu</h3>

      {loading && <p>Loading menu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
        {menu.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, maxWidth: "800px", width: "100%" }}>
          {menu.map((item, index) => (
            <li
              key={item.id || index}  // ✅ Ensures a unique key using `item.id` (fallback to `index` if needed)
              style={{
                background: "#f9f9f9",
                padding: "15px",
                margin: "10px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                textAlign: "left",
              }}
            >
              <h3 style={{ marginBottom: "5px" }}>{item.item_name}</h3>
              <p style={{ fontStyle: "italic", color: "gray" }}>{item.category_name}</p>
              <p>{item.item_description}</p>
              <p><strong>Price:</strong> ${item.price}</p>
        
              {/* Dietary Information */}
              <p>
                <strong>Dietary Info:</strong>
                {item.is_vegetarian ? " 🥦 Vegetarian" : ""}
                {item.is_vegan ? " 🌱 Vegan" : ""}
                {item.is_gluten_free ? " 🌾 Gluten-Free" : ""}
                {!item.is_vegetarian && !item.is_vegan && !item.is_gluten_free ? " 🍖 Contains Meat" : ""}
              </p>
        
              {/* Allergens */}
              {item.allergens.length > 0 && (
                <p style={{ color: "red" }}><strong>Allergens:</strong> {item.allergens.join(", ")}</p>
              )}
        
              <p style={{ fontSize: "12px", color: "gray" }}>
                <strong>Added on:</strong> {new Date(item.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>                
        ) : (
          !loading && <p>No menu items available.</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;
