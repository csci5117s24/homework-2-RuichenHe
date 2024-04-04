import { Link } from "react-router-dom";
import './style.css'
export default function TodoItem({todo, onStatusChange}) {
    const handleStatusChange = (e) => {
        // Determine the new status based on the checkbox's checked state
        const newStatus = e.target.checked ? 'done' : 'todo';

        // Invoke the callback with the todo ID and the new status
        onStatusChange(todo._id, newStatus);
    };
    return <div className={todo.status === 'todo' ? "todo-item color7-back" : "todo-item color9-back"}>
        <input 
                type="checkbox" 
                checked={todo.status === 'done'} 
                onChange={handleStatusChange}
            />
        <Link to={"/todo/"+todo._id} className={todo.status === 'todo' ? "todo-link color8" : "todo-link color10"}>{todo.title}</Link>
        </div>
}