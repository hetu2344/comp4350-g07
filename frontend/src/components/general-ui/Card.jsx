import classes from "./Card.module.css";

//This component provides a basic structure and design for any components
//that needs a card design on it (For example, Login and signup box)

function Card(props) {
  return <div className={classes.card}>{props.children}</div>;
}

export default Card;
