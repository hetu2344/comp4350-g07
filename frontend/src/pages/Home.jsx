import { useState, useEffect } from "react";
import HomePageNavigation from "../components/layout/HomePageNavigation";
import { Link } from "react-router-dom";
import "./Home.css";

function HomePage() {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch("http://localhost:8018/api/menu");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMenu(data);
      } catch (error) {
        setError("Failed to fetch menu items. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return (
    <div className="homepage">
      <HomePageNavigation />

      <div className="home-container">
        <header className="home-header">
          <h1>🍽️ Welcome to RestroSync!</h1>
          <p>Discover our delightful menu</p>
        </header>

        {loading && <p className="loading">Loading menu...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && menu.length === 0 && (
          <p className="empty-menu">No menu items available.</p>
        )}

        <div className="menu-grid">
          {menu.map((item,index) => (
            <div key={item.id || `menu-item-${index}`} className="menu-card">
              <h3>{item.item_name}</h3>
              <span className="menu-category">{item.category_name}</span>
              <p className="menu-description">{item.item_description}</p>
              <div className="menu-price">${item.price.toFixed(2)}</div>

              <div className="dietary-info">
                {item.is_vegetarian && (
                  <span className="diet-icon vegetarian">🥗 Vegetarian</span>
                )}
                {item.is_vegan && (
                  <span className="diet-icon vegan">🌱 Vegan</span>
                )}
                {item.is_gluten_free && (
                  <span className="diet-icon gluten-free">🚫🌾 Gluten-Free</span>
                )}
                {!item.is_vegetarian && !item.is_vegan && !item.is_gluten_free && (
                  <span className="diet-icon meat">🍖 Contains Meat</span>
                )}
              </div>

              {item.allergens.length > 0 && (
                <p className="allergens">
                  <strong>Allergens:</strong> {item.allergens.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
