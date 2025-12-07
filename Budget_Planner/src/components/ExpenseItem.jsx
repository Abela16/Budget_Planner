import ExpenseDate from './ExpenseDate';
import './ExpenseItem.css'


function ExpenseItem(props) {
    const expenseDate = new Date(props.date);
   
   const month = expenseDate.toLocaleString('en-US', {month: 'long'});
   const day = expenseDate.toLocaleString('en-US', {day: '2-digit'});
   const year = expenseDate.getFullYear();

    return (
        <div className="expense-item">
            <ExpenseDate date={props.date}></ExpenseDate>
            <div className="expense-item-discription">
                <p className='expense-item-text'>{props.title}</p>
                <div className="expense-item-price">${props.price}</div>
            </div>

        </div>
    );
}

export default ExpenseItem;