import { Link } from "react-router-dom";

export default function TodoItem({todo}) {
    return <div>
        <Link to={"/todo/"+todo._id}>{todo.title}</Link>
        </div>
}