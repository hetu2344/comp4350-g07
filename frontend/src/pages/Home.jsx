import HomePageNavigation from "../components/layout/HomePageNavigation";
import { Link } from "react-router-dom";
/*
This page will be the homepage of the website
*/

function HomePage() {
  //The way this page is renedered is by first placing the Navigation header on top and then
  //rendering the rest of the page below
  return (
    <div>
      <HomePageNavigation />
      <h2>
        This will be the homepage when customer/staff first enters the website
      </h2>
      <h2>This page will have a menu displayed</h2>

      <Link to="/reservation">
        <button style={styles.reservationButton}>Make a Reservation</button>
      </Link>
    </div>
  );
}

const styles = {
  reservationButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#FF8C42",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "1rem",
  },
};

export default HomePage;
