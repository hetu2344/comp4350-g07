import { useState, useEffect } from "react";
import HomePageNavigation from "../components/layout/HomePageNavigation";
import "./Home.css";

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
    <div>
      <HomePageNavigation />
      <div className="home-container">
        <h2>Welcome to RestroSync</h2>
        <h3>Our Delicious Menu</h3>

        {loading && <p>Loading menu...</p>}
        {error && <p className="error">{error}</p>}

        <div className="menu-container">
          {menu.length > 0 ? (
            <ul className="menu-list">
              {menu.map((item, index) => (
                <li key={item.id || index} className="menu-item">
                  <h3>{item.item_name}</h3>
                  <p className="category">{item.category_name}</p>
                  <p>{item.item_description}</p>
                  <p>
                    <strong>Price:</strong> ${item.price}
                  </p>

                  {/* Dietary Information */}
                  <p>
                    <strong>Dietary Info:</strong>
                    {item.is_vegetarian ? " 🥦 Vegetarian" : ""}
                    {item.is_vegan ? " 🌱 Vegan" : ""}
                    {item.is_gluten_free ? " 🌾 Gluten-Free" : ""}
                    {!item.is_vegetarian &&
                    !item.is_vegan &&
                    !item.is_gluten_free
                      ? " 🍖 Contains Meat"
                      : ""}
                  </p>

                  {/* Allergens */}
                  {item.allergens.length > 0 && (
                    <p className="allergens">
                      <strong>Allergens:</strong> {item.allergens.join(", ")}
                    </p>
                  )}

                  <p className="date-added">
                    <strong>Added on:</strong>{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            !loading && <p>No menu items available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
