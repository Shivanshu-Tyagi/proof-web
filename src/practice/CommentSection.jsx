import React from "react";

function HOC() {
   return function Enhanced() {
    const [count,setCount]=React.useState(0);

    const increment = () => setCount(count + 1);

    return (
        <Effects
        count={count}
        increment={increment}
        />
    )
   }
}



function button({count,increment}) {
    return(
        <button onClick={increment}>{count}</button>
    )
}
function HoverCounter({ count, increment }) {
    return <h3 onMouseOver={increment}>Hovered {count} times</h3>;
  }

const Increment = HOC(button);
const Hover = HOC(HoverCounter);
function Apin(){
    return(
        <>
        <Increment/>
        <Hover/>
        </>
    )
}

export default Apin