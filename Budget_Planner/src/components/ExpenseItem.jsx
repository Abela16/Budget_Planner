import ExpenseDate from './ExpenseDate';
import Card from './Card';
import './ExpenseItem.css';


function ExpenseItem(props) {

    
    return (
        <Card className="expense-item">
            <ExpenseDate date={props.date}></ExpenseDate>
            <div className="expense-item-discription">
                <p className='expense-item-text'>{props.title}</p>
                <div className="expense-item-price">${props.price}</div>
            </div>

        </Card>
    );
}

export default ExpenseItem;
