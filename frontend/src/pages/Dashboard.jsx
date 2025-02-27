import DashboardNavigation from "../components/layout/DashboardNavigation";

/*This page is the first page the staff is going to see when they log in
 */

function DashboardPage() {
  const userData = JSON.parse(localStorage.getItem("userData")); //Get user data from local storage
  //To get user data for pages that are post-login stage, use the above line

  //The way this page is renedered is by first placing the Navigation header on top and then
  //rendering the rest of the page below
  //Welcome, {userData.fName} {userData.lName}!
  return (
    <div>
      <DashboardNavigation />
      <h1>test</h1>
      <h2>
        This is where the rest of the features of the website will be at or
        start at
      </h2>
    </div>
  );
}

export default DashboardPage;
