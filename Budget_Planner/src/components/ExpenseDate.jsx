import './ExpenseDate.css'
function ExpenseDate(props){
    const expenseDate = new Date(props.date)
    
    const day = expenseDate.toLocaleString('en-US', {day: '2-digit'})
    const month = expenseDate.toLocaleString('en-US', {month: 'long'});
    const year = expenseDate.getFullYear();

    return(
        <div className="expense-date">
            <div className="expense-date_month">{month}</div>
            <div className="expense-date_year">{year}</div>
            <div className="expense-date_day">{day}</div>
      
        </div>
    )
}

export default ExpenseDate;