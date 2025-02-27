import HomePageNavigation from "../components/layout/HomePageNavigation";

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
    </div>
  );
}

export default HomePage;
