import HomePageNavigation from "../components/layout/HomePageNavigation";

function HomePage() {
  return (
    <div>
      <HomePageNavigation />
      <h2>
        This will be the homepage when customer/staff first enters the website
      </h2>
      <ul>
        <li>This page will have a menu displayed</li>
        <li>plus other features</li>
      </ul>
    </div>
  );
}

export default HomePage;
