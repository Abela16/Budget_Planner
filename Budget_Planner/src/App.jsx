import Expenses from "./components/Expenses.jsx";
import './App.css'

function App() {

  const expenses = [
    {id: 'e1', title: 'Car', amount: 4000, date: new Date(2024, 0, 7)},
    {id: 'e2', title: 'Phone', amount: 400, date: new Date(2025, 5, 6)},
    {id: 'e3', title: 'Laptop', amount: 400, date: new Date(2024, 5, 4)},
    {id: 'e4', title: 'Bike', amount: 800, date: new Date(2023, 2, 14)}
  ];
  return (
    <div className="text-center">
      <Expenses items={expenses}></Expenses>
    </div>
  );
}

export default App;