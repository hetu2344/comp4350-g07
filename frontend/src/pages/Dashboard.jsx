import DashboardNavigation from "../components/layout/DashboardNavigation";
import RoleProtection from "../components/security/RoleProtection";

/*This page is the first page the staff is going to see when they log in
 */

function DashboardPage({ user }) {
  //The way this page is renedered is by first placing the Navigation header on top and then
  //rendering the rest of the page below

  return (
    <div>
      <DashboardNavigation />
      <h1>Welcome {user.username}</h1>
      <h2>
        This is where the rest of the features of the website will be at or
        start at, please modify the layout according to your implementation wish
        -- maybe buttons to your features, etc
      </h2>
    </div>
  );
}

export default RoleProtection(DashboardPage, ["S", "M", "E"]);
