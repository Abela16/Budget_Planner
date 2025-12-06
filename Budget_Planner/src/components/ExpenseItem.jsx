import './ExpenseItem.css'

function ExpenseItem(props) {
    const expenseDate = new Date(props.date);
   
   const month = expenseDate.toLocaleString('en-US', {month: 'long'});
   const day = expenseDate.toLocaleString('en-US', {day: '2-digit'});
   const year = expenseDate.getFullYear();

    return (
        <div className="expense-item">
            <div>
            <div>{day}</div>
            <div>{month}</div>
            <div>{year}</div>
        </div>
            <div>March 28th 2025</div>
            <div className="expense-item-discription">
                <p className='expense-item-text'>{props.title}</p>
                <div className="expense-item-price">${props.price}</div>
            </div>

        </div>
    );
}

export default ExpenseItem;