import { Link } from "react-router-dom";

export default function CategoryItem({category}) {
    return <div>
        <Link to={"/todos/"+category.name}>{category.name}</Link>
        </div>
}