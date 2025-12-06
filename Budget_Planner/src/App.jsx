import ExpenseItem from "./components/ExpenseItem.jsx";

function App() {
  
  return (
    <div className="text-center">
      <ExpenseItem date="2024-01-07" title="Car " price="4000"></ExpenseItem>
      <ExpenseItem date="2025-06-06" title="Phone" price="400"></ExpenseItem>
      <ExpenseItem date="2024-06-04" title="Laptop" price="400"></ExpenseItem>
    </div>
  );
}

export default App;